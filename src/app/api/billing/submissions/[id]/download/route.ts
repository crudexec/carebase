import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";

// GET - Download EDI file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    // Check permission
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_VIEW,
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const submission = await prisma.claimSubmission.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        ediFileName: true,
        ediContent: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (!submission.ediContent) {
      return NextResponse.json(
        { error: "No EDI content available for this submission" },
        { status: 404 }
      );
    }

    const filename = submission.ediFileName || `837P_${id}.edi`;

    return new NextResponse(submission.ediContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Filename": filename,
      },
    });
  } catch (error) {
    console.error("Error downloading EDI file:", error);
    return NextResponse.json(
      { error: "Failed to download EDI file" },
      { status: 500 }
    );
  }
}
