import type { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";

import type { Role } from "./permissions";

import {

  recordStaffLoginSuccess,

  validateStaffLogin,

} from "./validateStaffLogin";

import { loadLiveSessionUser } from "./sessionUser";



const SESSION_MAX_AGE = 15 * 60;

/** Throttle MongoDB re-sync in jwt callback (ms). */

const JWT_SYNC_INTERVAL_MS = 30_000;



export const authOptions: NextAuthOptions = {

  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },

  pages: { signIn: "/login" },

  providers: [

    CredentialsProvider({

      name: "Credentials",

      credentials: {

        email: { label: "Email", type: "email" },

        password: { label: "Password", type: "password" },

        role: { label: "Role", type: "text" },

      },

      async authorize(credentials) {

        if (!credentials?.email || !credentials?.password) return null;



        try {

          const result = await validateStaffLogin({

            email: credentials.email,

            password: credentials.password,

            role: credentials.role,

            audit: false,

          });



          if (!result.ok) return null;



          await recordStaffLoginSuccess(result.userId);



          return {

            id: result.userId,

            email: result.email,

            name: result.name,

            role: result.role as Role,

          };

        } catch (err) {

          if (process.env.NODE_ENV === "development") {

            console.error("[auth] authorize error:", err);

          }

          return null;

        }

      },

    }),

  ],

  callbacks: {

    async jwt({ token, user }) {

      const now = Date.now();



      if (user) {

        token.uid = user.id;

        token.role = (user as { role?: Role }).role;

        token.active = true;

        token.lastSync = now;



        try {

          const live = await loadLiveSessionUser(user.id);

          if (!live || live.status === "suspended") {

            token.active = false;

          } else {

            token.role = live.role;

            token.sessionVersion = live.sessionVersion;

          }

        } catch (err) {

          if (process.env.NODE_ENV === "development") {

            console.error("[auth] jwt login sync error:", err);

          }

        }



        return token;

      }



      if (!token.uid) return token;



      const lastSync = (token.lastSync as number | undefined) ?? 0;

      if (now - lastSync < JWT_SYNC_INTERVAL_MS) {

        return token;

      }



      try {

        const live = await loadLiveSessionUser(String(token.uid));

        token.lastSync = now;



        if (!live || live.status === "suspended") {

          token.active = false;

          return token;

        }



        if (

          typeof token.sessionVersion === "number" &&

          live.sessionVersion !== token.sessionVersion

        ) {

          token.active = false;

          return token;

        }



        token.active = true;

        token.role = live.role;

        token.sessionVersion = live.sessionVersion;

      } catch (err) {

        if (process.env.NODE_ENV === "development") {

          console.error("[auth] jwt sync error:", err);

        }

      }



      return token;

    },

    async session({ session, token }) {

      if (!token.active || !token.uid || !token.role) {

        return { expires: new Date(0).toISOString() };

      }



      session.user = {

        id: token.uid as string,

        name: session.user?.name ?? null,

        email: session.user?.email ?? null,

        role: token.role as Role,

      };



      return session;

    },

  },

  secret: process.env.NEXTAUTH_SECRET,

};


