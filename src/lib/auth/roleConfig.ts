import type { Role } from "./permissions";

export type RoleLoginConfig = {
  role: Role;
  label: string;
  email: string;
  description: string;
};

/** Default seeded staff accounts — run `npm run db:seed:users` after Mongo is up. */
export const ROLE_LOGIN_CONFIG: RoleLoginConfig[] = [
  {
    role: "admin",
    label: "Admin",
    email: "admin@jadehospitainment.com",
    description: "Full operations, settings, and staff management",
  },
  {
    role: "staff",
    label: "Staff",
    email: "staff@jadehospitainment.com",
    description: "Bookings, calendar, blocks, and housekeeping",
  },
  {
    role: "team",
    label: "Team",
    email: "team@jadehospitainment.com",
    description: "Housekeeping and stay status updates",
  },
  {
    role: "seo",
    label: "SEO",
    email: "seo@jadehospitainment.com",
    description: "Blogs, sitemap, and analytics",
  },
  {
    role: "dev",
    label: "Dev",
    email: "dev@jadehospitainment.com",
    description: "Logs, webhooks, system, and debug tools",
  },
];

export const DEFAULT_SEED_PASSWORD = "JadeHost2026!";
