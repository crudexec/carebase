import { NextResponse } from "next/server";

// Public company registration is disabled.
// New users must be invited via /api/invites and register at /register/invite
export async function POST() {
  return NextResponse.json(
    {
      error: "Registration is by invitation only",
      message: "Please contact your administrator for an invite link."
    },
    { status: 403 }
  );
}
