import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendNotification } from "@/lib/notifications";

// POST /api/notifications/test - Send a test notification to yourself
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to test
    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const result = await sendNotification({
      eventType: "SHIFT_ASSIGNED",
      recipientIds: [session.user.id],
      data: {
        clientName: "Test Client",
        shiftDate: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
        shiftTime: "9:00 AM",
        shiftEndTime: "1:00 PM",
        address: "123 Test Street, Test City, TX 12345",
        shiftUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/scheduling`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test notification sent",
      result,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to send test notification", details: errorMessage },
      { status: 500 }
    );
  }
}
