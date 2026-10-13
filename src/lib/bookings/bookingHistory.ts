import { connectDB } from "@/lib/db";
import { AuditLogModel } from "@/models/AuditLog";
import { BookingModel } from "@/models/Booking";
import { UserModel } from "@/models/User";
import { WebhookEventModel } from "@/models/WebhookEvent";
import { formatBookingSource } from "./sourceLabels";

export type BookingHistoryEntry = {
  id: string;
  at: string;
  action: string;
  title: string;
  detail?: string;
  actor?: string;
  actorType: "staff" | "system" | "ota" | "payment" | "guest";
  metadata?: Record<string, unknown>;
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function describeAuditEntry(
  action: string,
  metadata: Record<string, unknown>,
): { title: string; detail?: string; actorType: BookingHistoryEntry["actorType"] } {
  switch (action) {
    case "booking.create": {
      const src = metadata.source as string | undefined;
      if (src === "axisrooms_inbound") {
        return {
          title: "OTA reservation received",
          detail: metadata.bookingNo
            ? `Axis booking #${metadata.bookingNo}${metadata.conflict ? " — conflict with direct booking" : ""}`
            : undefined,
          actorType: "ota",
        };
      }
      if (metadata.onHold || metadata.status === "on_hold") {
        return {
          title: "Staff placed dates on hold",
          detail: "OTA inventory blocked immediately",
          actorType: "staff",
        };
      }
      const channel = formatBookingSource(
        (metadata.source as string) ?? "website",
      );
      return {
        title: `Booking created — ${channel.shortLabel}`,
        detail:
          metadata.status === "pending"
            ? "Awaiting Razorpay payment"
            : undefined,
        actorType: metadata.source === "admin_manual" ? "staff" : "guest",
      };
    }
    case "booking.confirm_hold":
      return {
        title: metadata.waivePayment
          ? "Hold confirmed (payment waived)"
          : "Hold confirmed — external payment received",
        detail: "Status changed from on hold to confirmed",
        actorType: "staff",
      };
    case "booking.confirm_external_payment": {
      const channel = metadata.paymentChannel
        ? String(metadata.paymentChannel).replace(/_/g, " ")
        : undefined;
      const ref = metadata.externalPaymentRef
        ? String(metadata.externalPaymentRef)
        : undefined;
      const amount =
        typeof metadata.receivedPaise === "number"
          ? `₹${(metadata.receivedPaise / 100).toLocaleString("en-IN")}`
          : undefined;
      const parts = [
        channel ? `via ${channel}` : undefined,
        amount,
        ref ? `ref ${ref}` : undefined,
      ].filter(Boolean);
      return {
        title: "Offline payment confirmed — booking confirmed",
        detail:
          parts.length > 0
            ? parts.join(" · ")
            : "Guest confirmation email sent",
        actorType: "staff",
      };
    }
    case "booking.update": {
      if (metadata.source === "axisrooms_inbound" && metadata.eventType === "modify") {
        const oldRange =
          metadata.oldCheckIn && metadata.oldCheckOut
            ? `${metadata.oldCheckIn} → ${metadata.oldCheckOut} updated to `
            : "";
        return {
          title: "OTA reservation modified",
          detail: `${oldRange}${metadata.checkIn ?? "?"} to ${metadata.checkOut ?? "?"}`,
          actorType: "ota",
        };
      }
      if (metadata.action === "modify_dates") {
        const delta =
          typeof metadata.pricingDeltaPaise === "number"
            ? ` · ${metadata.pricingDeltaPaise >= 0 ? "+" : ""}₹${(Math.abs(metadata.pricingDeltaPaise) / 100).toLocaleString("en-IN")}`
            : "";
        return {
          title: "Staff rescheduled stay",
          detail: `${metadata.oldCheckIn ?? "?"} → ${metadata.oldCheckOut ?? "?"} changed to ${metadata.newCheckIn ?? "?"} → ${metadata.newCheckOut ?? "?"}${delta}`,
          actorType: "staff",
        };
      }
      if (metadata.stayStatus) {
        return {
          title: `Housekeeping — ${metadata.stayStatus}`,
          actorType: "staff",
        };
      }
      if (metadata.notes) {
        return { title: "Staff notes updated", actorType: "staff" };
      }
      if (metadata.status === "confirmed" && metadata.paymentId) {
        return {
          title: "Payment confirmed — booking confirmed",
          detail: `Razorpay payment ${metadata.paymentId}`,
          actorType: "payment",
        };
      }
      return {
        title: "Booking updated",
        detail: metadata.status ? `Status: ${metadata.status}` : undefined,
        actorType: "staff",
      };
    }
    case "booking.cancel":
      return {
        title: "Reservation cancelled",
        detail:
          metadata.source === "axisrooms_inbound"
            ? "Cancelled via Axis Rooms / OTA channel"
            : metadata.reason
              ? String(metadata.reason)
              : metadata.previousStatus
                ? `Was ${String(metadata.previousStatus).replace("_", " ")}`
                : undefined,
        actorType:
          metadata.source === "axisrooms_inbound"
            ? "ota"
            : metadata.cancelledBy === "staff"
              ? "staff"
              : "system",
      };
    case "booking.expire":
      return {
        title: "Pending booking expired",
        detail: "Payment window closed — dates released",
        actorType: "system",
      };
    case "axisrooms.inventory.close":
      return {
        title: "OTA inventory blocked",
        detail: metadata.error
          ? `Sync failed: ${metadata.error}`
          : `${metadata.nights ?? "?"} night(s) closed on channel manager`,
        actorType: "system",
      };
    case "axisrooms.inventory.open":
      return {
        title: "OTA inventory released",
        detail: metadata.error
          ? `Sync failed: ${metadata.error}`
          : `${metadata.nights ?? "?"} night(s) reopened on channel manager`,
        actorType: "system",
      };
    case "refund.issue":
      return {
        title: "Razorpay refund issued",
        detail: metadata.reason ? String(metadata.reason) : undefined,
        actorType: "staff",
      };
    default:
      return {
        title: action.replace(/[._]/g, " "),
        actorType: "system",
      };
  }
}

/** Chronological activity log for a booking folio. */
export async function getBookingHistory(
  bookingId: string,
): Promise<BookingHistoryEntry[]> {
  await connectDB();

  const booking = await BookingModel.findOne({
    _id: bookingId,
    isDeleted: false,
  }).lean();
  if (!booking) return [];

  const auditRows = await AuditLogModel.find({
    targetType: "booking",
    targetId: bookingId,
  })
    .sort({ createdAt: 1 })
    .lean();

  const userIds = Array.from(
    new Set(
      auditRows
        .map((r) => r.userId)
        .filter((id): id is NonNullable<typeof id> => id != null)
        .map(String),
    ),
  );
  const users =
    userIds.length > 0
      ? await UserModel.find({ _id: { $in: userIds } })
          .select("name email role")
          .lean()
      : [];
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const entries: BookingHistoryEntry[] = auditRows.map((row) => {
    const meta = (row.metadata ?? {}) as Record<string, unknown>;
    const described = describeAuditEntry(row.action, meta);
    const user = row.userId ? userMap.get(String(row.userId)) : undefined;
    let actor = described.actorType === "ota"
      ? "Axis Rooms / OTA"
      : described.actorType === "payment"
        ? "Razorpay"
        : described.actorType === "system"
          ? "System"
          : user?.name ?? (row.userId ? "Staff" : "Guest");

    if (meta.source === "axisrooms_inbound" && row.action === "booking.cancel") {
      actor = "Axis Rooms / OTA";
    }

    return {
      id: String(row._id),
      at: (row.createdAt ?? new Date()).toISOString(),
      action: row.action,
      title: described.title,
      detail: described.detail,
      actor,
      actorType: described.actorType,
      metadata: meta,
    };
  });

  if (booking.axisRoomsReservationId) {
    const prefix = escapeRegex(booking.axisRoomsReservationId);
    const webhooks = await WebhookEventModel.find({
      source: "axisrooms",
      eventId: { $regex: `^${prefix}:` },
    })
      .sort({ createdAt: 1 })
      .lean();

    for (const wh of webhooks) {
      const statusPart = wh.eventId?.split(":").slice(1).join(":") ?? "update";
      const duplicate = entries.some(
        (e) =>
          e.action === "booking.create" &&
          e.at === (wh.createdAt ?? new Date()).toISOString(),
      );
      if (duplicate) continue;

      entries.push({
        id: `wh-${wh._id}`,
        at: (wh.createdAt ?? new Date()).toISOString(),
        action: "webhook.axisrooms",
        title: `Axis Rooms webhook — ${statusPart}`,
        detail: `Event ${wh.eventId}`,
        actor: "Axis Rooms",
        actorType: "ota",
      });
    }
  }

  const hasCreate = entries.some((e) => e.action === "booking.create");
  if (!hasCreate && booking.createdAt) {
    const src = formatBookingSource(booking.source);
    entries.unshift({
      id: `milestone-created-${bookingId}`,
      at: new Date(booking.createdAt).toISOString(),
      action: "milestone.created",
      title: `Booking created — ${src.shortLabel}`,
      actor: src.channel === "ota" ? "Axis Rooms / OTA" : src.channel === "staff" ? "Staff" : "Guest",
      actorType:
        src.channel === "ota"
          ? "ota"
          : src.channel === "staff"
            ? "staff"
            : "guest",
    });
  }

  if (booking.status === "cancelled" && booking.updatedAt) {
    const hasCancel = entries.some((e) => e.action === "booking.cancel");
    if (!hasCancel) {
      entries.push({
        id: `milestone-cancelled-${bookingId}`,
        at: new Date(booking.updatedAt).toISOString(),
        action: "milestone.cancelled",
        title: "Reservation cancelled",
        actor: booking.source?.startsWith("axisrooms_")
          ? "Axis Rooms / OTA"
          : "System",
        actorType: booking.source?.startsWith("axisrooms_") ? "ota" : "system",
      });
    }
  }

  entries.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  return entries;
}
