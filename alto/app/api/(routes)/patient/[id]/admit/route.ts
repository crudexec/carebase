import dayjs from "dayjs";
import { isEmpty } from "lodash";

import prisma from "@/prisma";
import { ObjectData } from "@/types";

import {
  ApiResponse,
  asyncForEach,
  asyncWrapper,
  CustomRequest,
} from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { createLog } from "../../../log/helper";

type ParamProps = { params: { id: string } };

const admitPatient = async (
  req: CustomRequest,
  { params: { id } }: ParamProps,
) => {
  const data = await req.json();
  const {
    physician,
    MEDICARE,
    NON_MEDICARE,
    MANAGED_CARE,
    CMS,
    HOSPICE,
    caregiver,
    daysPerEpisode,
    payer,
    ...rest
  } = data;
  const updatedPatient = await prisma.patient.update({
    where: { id: id as string, providerId: req.user.providerId },
    data: rest,
    include: { physician: true },
  });
  if (!isEmpty(physician)) {
    const { id } = physician;
    if (id) {
      await prisma.patient.update({
        where: { id: updatedPatient.id, providerId: req.user.providerId },
        data: { physician: { connect: { id: physician.id } } },
      });
    }
  }
  const newObj = {
    CMS,
    MEDICARE,
    NON_MEDICARE,
    MANAGED_CARE,
    HOSPICE,
  } as ObjectData;
  await prisma.patientInsurance.createMany({
    data: Object.keys(newObj)
      .filter((item) => !newObj[item]?.id)
      .map((key) => ({ patientId: id as string, type: key, ...newObj[key] })),
  });

  await asyncForEach(
    Object.keys(newObj).filter((item) => newObj[item]?.id),
    async (key) => {
      await prisma.patientInsurance.update({
        where: {
          id: newObj[key].id,
          patient: { providerId: req.user?.providerId },
        },
        data: newObj[key],
      });
    },
  );
  if (caregiver) {
    await prisma.patientAccessInformation.upsert({
      where: {
        patientId: id as string,
        patient: { providerId: req.user?.providerId },
      },
      create: { patientId: id as string, caregivers: [caregiver] },
      update: { patientId: id as string, caregivers: [caregiver] },
    });
  }
  await prisma.patientAdmission.create({
    data: {
      patientId: id as string,
      payer: payer,
      actionById: req.user.id,
      status: "ACTIVE",
      certStartDate: new Date(),
      certEndDate: dayjs().add(daysPerEpisode, "day").toDate(),
      daysPerEpisode,
    },
  });
  await createLog(
    "PATIENT",
    "Patient admitted",
    id as string,
    req.user?.providerId as string,
  );
  return ApiResponse(null, "Patient admitted successfully");
};

const PUT = handler(authorizeUser, asyncWrapper(admitPatient));
export { PUT };
