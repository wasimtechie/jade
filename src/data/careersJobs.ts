/**
 * Canonical careers roles — keep in sync with /careers listing UI.
 * `id` is stored as career_applications.job_id for role-based indexing.
 */
export const OPEN_APPLICATION_JOB_ID = "open-application";

export type CareerJob = {
  id: string;
  title: string;
  purpose: string;
  lookingFor: string[];
  purposeToTeam?: string[];
};

export const CAREERS_JOBS: CareerJob[] = [
  {
    id: "sales",
    title: "SALES EXECUTIVES",
    purpose: "Drive growth and build relationships with our clients.",
    lookingFor: [
      "2+ years experience in luxury sales",
      "Excellent communication skills",
      "Goal-oriented mindset",
    ],
  },
  {
    id: "content-creator",
    title: "CONTENT CREATOR",
    purpose:
      "As a Content Creator Intern, you'll play a key role in telling our brand story online from showcasing our design work to capturing everyday studio moments. You'll work closely with the marketing and design teams to create content that's relevant, engaging, and aligned with what people love to see and share.",
    lookingFor: [
      "0-2 years of hands-on experience with content creation — personal pages/projects count too!",
      "Strong interest in social media trends, storytelling, and visual content",
      "Familiarity with editing tools like CapCut, InShot, Canva, or basic video software",
      "Good understanding of what works across Instagram, LinkedIn, YouTube Shorts, etc.",
      "Excellent written and verbal communication skills",
      "Proactive, detail-oriented, and comfortable working in a fast-paced creative environment",
      "Bonus: If you've run your own page, grown a following, or had content go viral — tell us about it!",
      "Must share your Instagram / LinkedIn profiles or a portfolio showcasing your past work",
    ],
    purposeToTeam: [
      "Create and share content that highlights our design work, studio culture, and team wins",
      "Pitch and produce ideas for reels, stories, carousels, and short-form videos",
      "Capture behind-the-scenes moments and everyday interactions at the studio",
      "Bring awareness to our work by staying current with trends and tailoring them to fit our brand",
    ],
  },
  {
    id: "marketing-intern",
    title: "MARKETING INTERN",
    purpose: "Assist our marketing team in executing campaigns and strategies.",
    lookingFor: [
      "Currently pursuing or recently completed a degree in Marketing",
      "Strong writing and research skills",
      "Familiarity with digital marketing tools",
    ],
  },
  {
    id: "content-writer",
    title: "CONTENT WRITER",
    purpose: "Craft compelling narratives and copy for our brand.",
    lookingFor: [
      "Strong portfolio of written work",
      "Ability to write in a premium, editorial voice",
      "Experience with SEO is a plus",
    ],
  },
  {
    id: "photographer",
    title: "PHOTOGRAPHER",
    purpose:
      "Capture the essence of our VILLAS and experiences through high-end photography.",
    lookingFor: [
      "Experience in architectural or lifestyle photography",
      "Proficient in Adobe Lightroom and Photoshop",
      "Keen eye for detail and composition",
    ],
  },
  {
    id: "video-editor",
    title: "VIDEO EDITOR",
    purpose: "Create cinematic video content for our social platforms.",
    lookingFor: [
      "Expertise in Premiere Pro or DaVinci Resolve",
      "Experience with short-form and high-production content",
      "Strong sense of pacing and music integration",
    ],
  },
  {
    id: "social-media-intern",
    title: "SOCIAL MEDIA INTERN",
    purpose: "Engage with our community and manage our social presence.",
    lookingFor: [
      "Deep understanding of current social trends",
      "Creative mindset for community engagement",
      "Basic design/video skills for social stories",
    ],
  },
];

const JOB_BY_ID = new Map(CAREERS_JOBS.map((j) => [j.id, j]));

export function getCareerJobById(jobId: string): CareerJob | undefined {
  return JOB_BY_ID.get(jobId);
}

export function resolveCareerJobTitle(jobId: string): string {
  if (jobId === OPEN_APPLICATION_JOB_ID) return "Open application";
  return getCareerJobById(jobId)?.title ?? jobId;
}
