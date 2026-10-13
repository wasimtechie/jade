import { connectDB } from "@/lib/db";
import { VillaModel } from "@/models/Villa";
import { villaAxisRoomsMapping } from "./mapBooking";

export type AxisRoomsCsvRow = {
  hotelId: string;
  hotelName: string;
  roomId: string;
  ratePlanId: string;
  ratePlanName: string;
  noOfRooms: string;
};

export async function listVillasForAxisCsv(): Promise<AxisRoomsCsvRow[]> {
  await connectDB();
  const villas = await VillaModel.find({ isDeleted: false }).lean();

  return villas
    .map((v) => {
      const m = villaAxisRoomsMapping(v);
      const hotelId = m.propertyId ?? "";
      return {
        row: {
          hotelId,
          hotelName: v.name ?? v.slug ?? "",
          roomId: m.roomTypeId ?? "1",
          ratePlanId: m.ratePlanId ?? "1",
          ratePlanName: m.ratePlanName ?? "Best Available Rate",
          noOfRooms: "1",
        },
        hotelIdNum: Number(hotelId) || 0,
      };
    })
    .sort((a, b) => a.hotelIdNum - b.hotelIdNum || a.row.hotelName.localeCompare(b.row.hotelName))
    .map((x) => x.row);
}

export function axisCsvToString(rows: AxisRoomsCsvRow[]): string {
  const header = "hotelId,hotelName,roomId,ratePlanId,ratePlanName,noOfRooms";
  const lines = rows.map(
    (r) =>
      `${csvEsc(r.hotelId)},${csvEsc(r.hotelName)},${csvEsc(r.roomId)},${csvEsc(r.ratePlanId)},${csvEsc(r.ratePlanName)},${r.noOfRooms}`,
  );
  return [header, ...lines].join("\n");
}

function csvEsc(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
