import { NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";

// GET /api/auth/mobile/session - Verify mobile token and return user
export async function GET(request: Request) {
  try {
    const user = await getMobileUser(request);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
      },
    });
  } catch (error) {
    console.error("Mobile session error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
