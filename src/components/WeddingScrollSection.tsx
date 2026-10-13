"use client";

import ExperienceScrollSection from "./ExperienceScrollSection";

export default function WeddingScrollSection({
  id = "wedding-philosophy",
}: {
  id?: string;
}) {
  return <ExperienceScrollSection variant="wedding" id={id} />;
}
