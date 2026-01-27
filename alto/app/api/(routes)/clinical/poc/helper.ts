import { getImageUrl, isActive, isTrue } from "@/app/api/lib";
import prisma from "@/prisma";

export async function getPlanOfCares(
  patientId?: string,
  status?: string,
  isCert485?: string,
) {
  const result = await prisma.planOfCare.findMany({
    where: {
      patientId,
      active: isActive(status),
      isCert485: isTrue(isCert485),
    },
    select: {
      id: true,
      patient: {
        select: {
          patientAdmission: {
            select: {
              status: true,
              actionDate: true,
            },
          },
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      caregiver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      physician: true,
      ordersAndGoals: true,
      pocDiagnosisProcedure: true,
      certStartDate: true,
      certEndDate: true,
      signatureReceivedDate: true,
      signatureSentDate: true,
      createdAt: true,
      qAstatus: true,
    },
  });
  return { planOfCares: result, totalCount: result.length };
}

export const getPlanOfCare = async (
  planOfCareId: string,
  providerId: string,
) => {
  const planOfCare = await prisma.planOfCare.findUnique({
    where: { id: planOfCareId },
    include: {
      caregiver: true,
      patient: {
        include: {
          patientAdmission: true,
        },
      },
      physician: true,
      ordersAndGoals: true,
      pocDiagnosisProcedure: true,
      nurseSignature: true,
    },
  });
  return {
    ...planOfCare,
    nurseSignatureUrl: await getImageUrl(
      providerId,
      planOfCare?.nurseSignature?.mediaId,
    ),
  };
};
