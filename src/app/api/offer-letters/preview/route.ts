import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { buildOfferRenderContext } from "@/lib/offer-letters/context";
import {
  renderOfferTemplate,
  validateOfferTags,
} from "@/lib/offer-letters/rendering";
import { removeLegacyOfferDetailTags } from "@/lib/offer-letters/legacy";

const ALLOWED_ROLES = ["ADMIN", "OPS_MANAGER"] as const;

const previewSchema = z.object({
  subject: z.string().min(1),
  bodyHtml: z.string().min(1),
  employeeId: z.string().optional(),
  recipientFirstName: z.string().optional(),
  recipientLastName: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional().nullable(),
  recipientRole: z.nativeEnum(UserRole).optional().nullable(),
  offerData: z.record(z.string(), z.unknown()).default({}),
});

function canManage(role: string) {
  return ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManage(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = previewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    const { context } = await buildOfferRenderContext({
      companyId: session.user.companyId,
      recipient: data,
      offerData: data.offerData,
    });

    const bodyHtml = removeLegacyOfferDetailTags(data.bodyHtml);
    const combinedTemplate = `${data.subject}\n${bodyHtml}`;
    const tagValidation = validateOfferTags(combinedTemplate, context);

    return NextResponse.json({
      subject: renderOfferTemplate(data.subject, context),
      bodyHtml: renderOfferTemplate(bodyHtml, context),
      tags: tagValidation.tags,
      unknownTags: tagValidation.unknownTags,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to preview offer letter";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
