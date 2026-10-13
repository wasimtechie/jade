"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

const SESSION_POLL_SECONDS = 60;

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={SESSION_POLL_SECONDS}>
      {children}
    </SessionProvider>
  );
}
