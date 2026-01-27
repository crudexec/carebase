import { isEmpty } from "lodash";

import prisma from "@/prisma";

import { filterArray, pickValues } from "../../../../../lib";
import {
  ApiResponse,
  asyncWrapper,
  createOrUpdateMany,
  CustomRequest,
  deleteMissingItems,
  ErrorResponse,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const updateReferralSource = asyncWrapper(async (req: CustomRequest) => {
  const body = await req.json();
  const { id, patientId, pharmacy, ...rest } = body;
  const patient = await prisma.patient.findUnique({
    where: { id: patientId, providerId: req.user.providerId },
  });
  if (!patient) {
    return ErrorResponse("patient does not exist", 400);
  }
  if (id) {
    await prisma.patientReferralSource.update({
      where: { id, patient: { providerId: req.user.providerId } },
      data: { ...rest },
    });
    await deleteMissingItems(pharmacy, "pharmacy", {
      patientReferralSourceId: id,
    });
    if (pharmacy.length) {
      await createOrUpdateMany(pharmacy, "pharmacy", {
        patientReferralSourceId: id,
      });
    }
  } else {
    const newPharmacy = filterArray(pharmacy);
    if (newPharmacy.length || !isEmpty(pickValues(rest))) {
      const patientReferralSource = await prisma.patientReferralSource.create({
        data: {
          ...rest,
          patient: { connect: { id: patientId } },
          ...(newPharmacy.length && { pharmacy: { create: pharmacy } }),
        },
      });
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          patientReferralSource: { connect: { id: patientReferralSource.id } },
        },
      });
    }
  }
  return ApiResponse(null, "Patient referral source updated successfully");
});

const PUT = handler(authorizeUser, asyncWrapper(updateReferralSource));
export { PUT };
