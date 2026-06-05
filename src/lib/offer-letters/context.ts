import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  OfferData,
  OfferEmployeeData,
  OfferRenderContext,
  buildRecipientSnapshot,
} from "./rendering";

export interface OfferRecipientInput {
  employeeId?: string;
  recipientFirstName?: string;
  recipientLastName?: string;
  recipientEmail?: string;
  recipientPhone?: string | null;
  recipientRole?: UserRole | null;
}

export async function buildOfferRenderContext({
  companyId,
  recipient,
  offerData,
}: {
  companyId: string;
  recipient: OfferRecipientInput;
  offerData: OfferData;
}): Promise<{
  context: OfferRenderContext;
  employeeId: string | null;
  recipientSnapshot: Prisma.InputJsonValue;
}> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, address: true, phone: true },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  let employee: OfferEmployeeData;
  let employeeId: string | null = null;

  if (recipient.employeeId) {
    const user = await prisma.user.findFirst({
      where: {
        id: recipient.employeeId,
        companyId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        profileData: true,
      },
    });

    if (!user) {
      throw new Error("Employee not found");
    }

    employeeId = user.id;
    employee = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile: user.profileData as Record<string, unknown> | null,
    };
  } else {
    if (!recipient.recipientFirstName || !recipient.recipientLastName || !recipient.recipientEmail) {
      throw new Error("Candidate name and email are required");
    }

    employee = {
      id: null,
      firstName: recipient.recipientFirstName,
      lastName: recipient.recipientLastName,
      email: recipient.recipientEmail.toLowerCase(),
      phone: recipient.recipientPhone || null,
      role: recipient.recipientRole || null,
      profile: null,
    };
  }

  return {
    context: {
      employee,
      company,
      offer: offerData,
    },
    employeeId,
    recipientSnapshot: buildRecipientSnapshot(employee) as Prisma.InputJsonValue,
  };
}
