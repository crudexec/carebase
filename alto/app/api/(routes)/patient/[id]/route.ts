import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";
import { createLog } from "../../log/helper";
import {
  createPatientAdmission,
  getPatientAdmissionStatus,
  updatePatientAdmission,
} from "./helper";

type ParamProps = { params: { id: string } };

const updatePatient = async (
  req: CustomRequest,
  { params: { id } }: ParamProps,
) => {
  const { status, reason, otherReason, admissionId, ...data } =
    await req.json();
  const admissionStatus = await getPatientAdmissionStatus(id as string);
  await prisma.patient.update({
    where: { id: id as string, providerId: req.user.providerId },
    data,
    include: { physician: true },
  });
  if (admissionStatus?.status !== status) {
    await createPatientAdmission(id as string, status, {
      reason,
      otherReason,
      actionById: req.user.id,
    });
    await createLog(
      "PATIENT",
      `Patient ${status}`,
      id as string,
      req.user.providerId as string,
    );
  } else {
    await updatePatientAdmission(admissionId, { reason, otherReason });
  }
  return ApiResponse(null, "Patient updated successfully");
};

const fetchPatientById = async (
  req: CustomRequest,
  { params: { id } }: ParamProps,
) => {
  const patient = await prisma.patient.findUnique({
    where: { id: id as string, providerId: req.user?.providerId },
    include: {
      patientAccessInformation: { include: { patient: true } },
      patientAuthorization: true,
      patientPolicyHolder: true,
      patientCommercial: true,
      patientEmergencyContact: true,
      patientInsurance: true,
      patientReferralSource: { include: { pharmacy: true } },
      physician: true,
      patientAdmission: {
        include: { actionBy: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      patientMedication: {
        include: {
          serviceRequested: true,
          primaryDx: true,
          medication: true,
          MIO12InpatientProcedure: true,
        },
      },
    },
  });
  return ApiResponse(patient);
};

const GET = handler(authorizeUser, asyncWrapper(fetchPatientById));
const PUT = handler(authorizeUser, asyncWrapper(updatePatient));

export { GET, PUT };
