import { PatientStatus, PayerType } from "@prisma/client";

import prisma from "@/prisma";

export async function getPatients(
  providerId: string,
  status?: string,
  payer?: string,
) {
  const result = await prisma.$transaction([
    prisma.patient.findMany({
      where: {
        providerId,
        patientAdmission: {
          some: {
            status: status?.toUpperCase() as PatientStatus,
            ...(payer && { payer: payer?.toUpperCase() as PayerType }),
          },
        },
      },
      include: {
        physician: true,
        patientPolicyHolder: true,
        patientAccessInformation: { include: { patient: true } },
        patientAuthorization: true,
        patientCommercial: true,
        patientEmergencyContact: true,
        patientInsurance: true,
        patientReferralSource: { include: { pharmacy: true } },
        patientMedication: {
          include: {
            serviceRequested: true,
            primaryDx: true,
            medication: true,
            MIO12InpatientProcedure: true,
          },
        },
        patientAdmission: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { patient: true, actionBy: true },
        },
      },
    }),
  ]);
  const patients = result[0]?.filter((pat) => {
    const patient = pat?.patientAdmission[0];
    return patient?.status === (status ?? "referred")?.toUpperCase();
  });
  return { patients, totalCount: patients.length };
}
