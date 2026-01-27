import { PatientStatus } from "@prisma/client";

import prisma from "@/prisma";
import { ObjectData } from "@/types";

export const getPatientAdmissionStatus = async (patientId: string) => {
  return await prisma.patientAdmission.findFirst({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    include: { actionBy: true, patient: true },
  });
};

export const createPatientAdmission = async (
  patientId: string,
  status: PatientStatus,
  others?: ObjectData,
) => {
  return await prisma.patientAdmission.create({
    data: { patientId, status, ...others },
  });
};

export const updatePatientAdmission = async (id: string, data?: ObjectData) => {
  return await prisma.patientAdmission.update({
    where: { id },
    data: { ...data },
  });
};
