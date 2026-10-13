import "next-auth";
import type { Role } from "@/lib/auth/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    uid?: string;
    active?: boolean;
    sessionVersion?: number;
    lastSync?: number;
  }
}
