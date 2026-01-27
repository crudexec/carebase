import { PayerType } from "@prisma/client";

import prisma from "@/prisma";

import {
  ApiResponse,
  asyncForEach,
  asyncWrapper,
  CustomRequest,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";
import { createLog } from "../../log/helper";

const patientAdimssion = asyncWrapper(async (req: CustomRequest) => {
  const body = await req.json();
  if (body.status === "active") {
    const admissions = await prisma.patientAdmission.createMany({
      data: body.patients.map((patient: string) => ({
        patientId: patient,
        payer: body.payer,
        actionById: req.user.id,
        status: "ACTIVE",
      })),
    });
    await asyncForEach(body.patients, async (patient: string) => {
      await createLog(
        "PATIENT",
        "Patient admitted",
        patient,
        req.user?.providerId as string,
      );
    });

    return ApiResponse(admissions, "Patient admitted successfully");
  } else {
    const admissions = await Promise.all(
      body.patients.map(async (pat: string) => {
        const patient = await prisma.patientAdmission.findUnique({
          where: { id: pat, patient: { providerId: req.user?.providerId } },
        });
        if (patient)
          return await prisma.patientAdmission.create({
            data: {
              patientId: patient?.patientId as string,
              payer: patient?.payer as PayerType,
              actionById: req.user.id,
              status: body.status.toUpperCase(),
              actionDate: body.date,
              reason: body.reason,
              otherReason: body.otherReason,
            },
          });
      }),
    );
    await asyncForEach(body.patients, async (patient: string) => {
      await createLog(
        "PATIENT",
        `Patient ${body.status}`,
        patient,
        req.user?.providerId as string,
      );
    });
    return ApiResponse(admissions, `Patient ${body.status} successfully`);
  }
});

const POST = handler(authorizeUser, asyncWrapper(patientAdimssion));
export { POST };
