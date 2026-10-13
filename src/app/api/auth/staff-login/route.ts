import { NextResponse } from "next/server";



/** Legacy staff login disabled — use NextAuth credentials at /login. */

export async function POST() {

  return NextResponse.json(

    {

      error:

        "Legacy password login is disabled. Sign in at /login with your staff account.",

    },

    { status: 410, headers: { "Cache-Control": "no-store" } },

  );

}



export async function DELETE() {

  return NextResponse.json({ ok: true });

}


