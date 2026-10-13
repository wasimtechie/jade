import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/authOptions";

import { loadLiveSessionUser } from "@/lib/auth/sessionUser";



export const dynamic = "force-dynamic";

export const runtime = "nodejs";



const noStore = { "Cache-Control": "no-store" } as const;



/** Live session check — re-reads MongoDB (suspended / role / version). */

export async function GET(_req: NextRequest) {

  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;



  if (!userId) {

    return NextResponse.json(

      { ok: false, code: "UNAUTHENTICATED" },

      { status: 401, headers: noStore },

    );

  }



  const live = await loadLiveSessionUser(userId);

  if (!live || live.status === "suspended") {

    return NextResponse.json(

      { ok: false, code: "ACCOUNT_SUSPENDED" },

      { status: 401, headers: noStore },

    );

  }



  return NextResponse.json(

    {

      ok: true,

      role: live.role,

      status: live.status,

      sessionVersion: live.sessionVersion,

    },

    { headers: noStore },

  );

}


