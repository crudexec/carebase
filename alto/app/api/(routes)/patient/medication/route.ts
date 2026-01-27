import { PrimaryDx } from "@prisma/client";
import { isEmpty } from "lodash";

import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  createOrUpdateMany,
  CustomRequest,
  deleteMissingItems,
  ErrorResponse,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";
import { getMedications } from "./helper";

const fetchMedications = async (req: CustomRequest) => {
  const { sort, search, status } = getQuery(req);
  const providerId = req.user?.providerId as string;
  const Medications = await getMedications(providerId, sort, search, status);
  return ApiResponse(Medications);
};

const createMedication = async (req: CustomRequest) => {
  const data = await req.json();
  const {
    medication,
    patientId,
    primaryDx,
    MIO12InpatientProcedure,
    serviceRequested,
    otherDx,
    ...rest
  } = data;

  if (!patientId) {
    return ErrorResponse("Patient id is required", 400);
  }
  if (
    !isEmpty(rest) ||
    medication.length ||
    MIO12InpatientProcedure.length ||
    serviceRequested.length ||
    !isEmpty(primaryDx) ||
    otherDx.length
  ) {
    const createdMedication = await prisma.patientMedication.create({
      data: {
        patient: {
          connect: {
            id: patientId,
          },
        },
        ...rest,
        ...(medication?.length && {
          medication: {
            createMany: {
              data: medication,
            },
          },
        }),
        ...(!isEmpty(primaryDx) && {
          primaryDx: {
            create: primaryDx,
          },
        }),
        ...(MIO12InpatientProcedure?.length && {
          MIO12InpatientProcedure: {
            create: MIO12InpatientProcedure,
          },
        }),
        ...(serviceRequested?.length && {
          serviceRequested: {
            create: serviceRequested,
          },
        }),
      },
    });

    if (otherDx?.length) {
      await prisma.primaryDx.createMany({
        data: otherDx.map((dx: PrimaryDx) => ({
          ...dx,
          patientMedicationId: createdMedication.id,
        })),
      });
    }
    return ApiResponse(createdMedication, "Medication created successfully");
  } else {
    return ApiResponse(null, "Medication created successfully");
  }
};

const updateMedication = async (req: CustomRequest) => {
  const data = await req.json();
  const {
    medication,
    primaryDx,
    MIO12InpatientProcedure: mio2Procedure,
    serviceRequested,
    otherDx,
    ...rest
  } = data;

  await prisma.patientMedication.update({
    where: {
      id: data?.id,
      patient: { providerId: req.user?.providerId },
    },
    data: rest,
  });

  if (!isEmpty(primaryDx)) {
    if (!primaryDx?.id) {
      await prisma.primaryDx.create({
        data: { ...primaryDx, patientMedicationId: rest.id },
      });
    } else {
      await prisma.primaryDx.update({
        where: {
          id: primaryDx?.id,
        },
        data: primaryDx,
      });
    }
  }

  await Promise.all([
    deleteMissingItems([...otherDx, primaryDx], "primaryDx", {
      patientMedicationId: rest.id,
    }),
    deleteMissingItems(medication, "medication", {
      patientMedicationId: rest.id,
    }),
    deleteMissingItems(serviceRequested, "serviceRequested", {
      patientMedicationId: rest.id,
    }),
    deleteMissingItems(mio2Procedure, "mIO12InpatientProcedure", {
      patientMedicationId: rest.id,
    }),
  ]);

  if (otherDx.length) {
    await createOrUpdateMany(otherDx, "primaryDx", {
      patientMedicationId: rest.id,
    });
  }

  if (medication.length) {
    await createOrUpdateMany(medication, "medication", {
      patientMedicationId: rest.id,
    });
  }

  if (serviceRequested.length) {
    await createOrUpdateMany(serviceRequested, "serviceRequested", {
      patientMedicationId: rest.id,
    });
  }

  if (mio2Procedure.length) {
    await createOrUpdateMany(mio2Procedure, "mIO12InpatientProcedure", {
      patientMedicationId: rest.id,
    });
  }

  return ApiResponse(null, "Medication updated successfully");
};

const deleteMedications = async (req: CustomRequest) => {
  const { ids, status: currentStatus } = await req.json();
  await prisma.patientMedication.updateMany({
    where: {
      id: {
        in: ids,
      },
      patient: { providerId: req.user?.providerId },
    },
    data: {
      active: currentStatus === "active" ? false : true,
      archivedOn: currentStatus === "active" ? new Date() : null,
    },
  });
  return ApiResponse(
    null,
    `Medication(s) ${currentStatus === "active" ? "archived" : "activated"} successfully`,
  );
};

const GET = handler(authorizeUser, asyncWrapper(fetchMedications));
const POST = handler(authorizeUser, asyncWrapper(createMedication));
const PUT = handler(authorizeUser, asyncWrapper(updateMedication));
const DELETE = handler(authorizeUser, asyncWrapper(deleteMedications));

export { DELETE, GET, POST, PUT };
