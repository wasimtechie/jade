export type LeadKind = "enquiry" | "partner";

export type LeadField = {
  label: string;
  value: string;
};

export type LeadSection = {
  title: string;
  items: LeadField[];
};

const TRAVEL_PREFERENCE_LABELS: Record<string, string> = {
  weekendGetaway: "Weekend getaways",
  corporateRetreat: "Corporate retreats",
  celebrationEvents: "Celebration events",
  oneDay: "One-Day Caravan Experience",
  overnight: "Overnight Caravan Retreat",
  multiDay: "Multi-Day Curated Journeys",
};

const PARTNER_PROPERTY_TYPE_LABELS: Record<string, string> = {
  privateVilla: "Private Villa",
  farmhouse: "Farmhouse",
  villaInGated: "Villa in gated community",
  retreatSpace: "Retreat Space",
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asNonEmptyString(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function pushField(
  rows: LeadField[],
  label: string,
  value: unknown,
) {
  const text = asNonEmptyString(value);
  if (text) rows.push({ label, value: text });
}

export function formatTravelPreferences(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const obj = value as Record<string, unknown>;
  return Object.entries(TRAVEL_PREFERENCE_LABELS)
    .filter(([key]) => obj[key] === true)
    .map(([, label]) => label);
}

function formatBooleanSelectionMap(
  value: unknown,
  labels: Record<string, string>,
): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const obj = value as Record<string, unknown>;
  return Object.entries(labels)
    .filter(([key]) => obj[key] === true)
    .map(([, label]) => label);
}

export function formatSelectionList(value: unknown): string | null {
  const items = asStringArray(value);
  return items.length ? items.join(", ") : null;
}

export function summarizeLeadPayload(
  payload: Record<string, unknown>,
  kind: LeadKind,
): string[] {
  const summary: string[] = [];

  const date =
    asNonEmptyString(payload.preferredDate) ??
    asNonEmptyString(payload.eventDate);
  const guests = asNonEmptyString(payload.guests);
  const occasion = asNonEmptyString(payload.occasionType);

  if (date) summary.push(date);
  if (guests) summary.push(`${guests} guests`);
  if (occasion) summary.push(occasion);

  if (kind === "partner") {
    const property = (payload.propertyDetails ?? {}) as Record<string, unknown>;
    const propertyTypes = formatBooleanSelectionMap(
      payload.propertyType,
      PARTNER_PROPERTY_TYPE_LABELS,
    );
    const location = asNonEmptyString(property.location);
    const bedrooms = asNonEmptyString(property.bedrooms);
    if (!summary.length && location) summary.push(location);
    if (bedrooms) summary.push(`${bedrooms} bedrooms`);
    if (!summary.length && propertyTypes.length) {
      summary.push(propertyTypes.join(", "));
    }
  }

  const formattedPrefs = formatTravelPreferences(payload.travelFormat);
  if (!summary.length && formattedPrefs.length) {
    summary.push(formattedPrefs.join(", "));
  }

  return summary.slice(0, 3);
}

export function buildLeadSections(
  payload: Record<string, unknown>,
  kind: LeadKind,
): LeadSection[] {
  const sections: LeadSection[] = [];

  const enquiryItems: LeadField[] = [];
  pushField(enquiryItems, "Guest count", payload.guests);
  pushField(
    enquiryItems,
    "Preferred date",
    payload.preferredDate ?? payload.eventDate,
  );
  pushField(enquiryItems, "Occasion", payload.occasionType);
  pushField(enquiryItems, "Enquiry page", payload.enquiryPage);

  if (enquiryItems.length) {
    sections.push({ title: "Enquiry details", items: enquiryItems });
  }

  const preferences = formatTravelPreferences(payload.travelFormat);
  if (preferences.length) {
    sections.push({
      title: "Travel preferences",
      items: [{ label: "Selected", value: preferences.join(", ") }],
    });
  }

  const weddingSelections: LeadField[] = [];
  const services = formatSelectionList(payload.services);
  const events = formatSelectionList(payload.events);
  const setting = formatSelectionList(payload.setting);
  if (services) weddingSelections.push({ label: "Services", value: services });
  if (events) weddingSelections.push({ label: "Events", value: events });
  if (setting) weddingSelections.push({ label: "Setting", value: setting });
  if (weddingSelections.length) {
    sections.push({ title: "Selections", items: weddingSelections });
  }

  const partnerProperty = (payload.propertyDetails ?? {}) as Record<string, unknown>;
  const partnerItems: LeadField[] = [];
  if (kind === "partner") {
    const propertyTypes = formatBooleanSelectionMap(
      payload.propertyType,
      PARTNER_PROPERTY_TYPE_LABELS,
    );
    pushField(partnerItems, "Company", payload.company);
    if (propertyTypes.length) {
      partnerItems.push({ label: "Property type", value: propertyTypes.join(", ") });
    }
    pushField(partnerItems, "Other type", payload.propertyOther);
    pushField(partnerItems, "Location", partnerProperty.location);
    pushField(partnerItems, "Bedrooms", partnerProperty.bedrooms);
    pushField(partnerItems, "Outdoor event capacity", partnerProperty.eventCapacity);
    if (partnerItems.length) {
      sections.push({ title: "Property details", items: partnerItems });
    }
  }

  const messageItems: LeadField[] = [];
  pushField(messageItems, "Notes", payload.notes);
  pushField(messageItems, "Special requests", payload.specialRequests);
  pushField(messageItems, "Queries", payload.queries);
  pushField(messageItems, "Partner details", payload.details);
  if (messageItems.length) {
    sections.push({ title: "Message & details", items: messageItems });
  }

  if (!sections.length) {
    sections.push({
      title: "Submitted data",
      items: Object.entries(payload)
        .map(([key, value]) => {
          if (value == null) return null;
          if (typeof value === "object") return null;
          const text = asNonEmptyString(String(value));
          return text
            ? {
                label: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
                value: text,
              }
            : null;
        })
        .filter((entry): entry is LeadField => Boolean(entry)),
    });
  }

  return sections;
}
