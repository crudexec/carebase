import { NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";

// POST /api/auth/mobile/logout - Mobile app logout
export async function POST(request: Request) {
  try {
    const user = await getMobileUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // For JWT-based auth, logout is handled client-side by deleting the token
    // Server could implement token blacklisting for enhanced security
    // For now, just acknowledge the logout

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Mobile logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
