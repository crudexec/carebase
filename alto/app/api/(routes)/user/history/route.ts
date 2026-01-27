import { isEmpty } from "lodash";

import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import { MAX_FILE_SIZE } from "@/constants";
import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  createOrUpdateMany,
  CustomRequest,
  deleteMissingItems,
  ErrorResponse,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";
import { addNewMedia, createLicense } from "./helper";

export type FileType = {
  mediaId: string;
  size: number;
  type: string;
  fileName: string;
};

const createUserHistory = asyncWrapper(async (req: CustomRequest) => {
  const data = await req.json();
  const {
    userId,
    caregiverCertifications,
    driversLicense,
    professionalLicense,
    media,
    ...rest
  } = data;
  if (!userId) {
    return ErrorResponse("User id is required", 400);
  }
  if (
    !isEmpty(rest) ||
    caregiverCertifications.length ||
    !isEmpty(driversLicense) ||
    !isEmpty(professionalLicense) ||
    !isEmpty(media)
  ) {
    let newDriversLicense, newProfessionalLicense;
    const totalSize = media?.reduce(
      (acc: number, media: FileType) => acc + media.size,
      0,
    );
    if (totalSize > MAX_FILE_SIZE) {
      return ErrorResponse(
        "Total media size should not be greater than 25GB",
        400,
      );
    }
    if (!isEmpty(driversLicense)) {
      newDriversLicense = await createLicense(driversLicense);
    }
    if (!isEmpty(professionalLicense)) {
      newProfessionalLicense = await createLicense(professionalLicense);
    }
    const createUserHistory = await prisma.userHistory.create({
      data: {
        user: { connect: { id: userId } },
        ...rest,
        ...(!isEmpty(driversLicense) && {
          driversLicense: { connect: { id: newDriversLicense?.id } },
        }),
        ...(!isEmpty(professionalLicense) && {
          professionalLicense: { connect: { id: newProfessionalLicense?.id } },
        }),
        ...(caregiverCertifications?.length && {
          caregiverCertifications: {
            createMany: { data: caregiverCertifications },
          },
        }),
        ...(media &&
          media?.length && {
            media: {
              createMany: {
                data: media?.map((media: FileType) => ({
                  mediaId: media.mediaId,
                  size: media.size,
                  fileType: media.type,
                  fileName: media.fileName,
                })),
              },
            },
          }),
      },
    });
    return ApiResponse(createUserHistory, "User History created successfully");
  } else {
    return ApiResponse(null, "User History created successfully");
  }
});

const updateUserHistory = asyncWrapper(async (req: CustomRequest) => {
  const data = await req.json();
  const {
    caregiverCertifications,
    driversLicense,
    professionalLicense,
    media,
    ...rest
  } = data;
  const history = await prisma.userHistory.update({
    where: {
      id: data?.id,
    },
    data: { ...rest },
    include: { driversLicense: true, professionalLicense: true },
  });
  await deleteMissingItems(caregiverCertifications, "caregiverCertification", {
    userHistoryId: rest.id,
  });
  if (!isEmpty(driversLicense)) {
    const { id, ...rest } = driversLicense;
    if (!id && !history.driversLicense) {
      const license = await prisma.license.create({ data: rest });
      await prisma.userHistory.update({
        where: { id: history.id },
        data: { driversLicense: { connect: { id: license.id } } },
      });
    } else {
      await prisma.license.update({ where: { id: id }, data: rest });
    }
  }
  if (!isEmpty(professionalLicense)) {
    const { id, ...rest } = professionalLicense;
    if (!id && !history.professionalLicense) {
      const license = await prisma.license.create({ data: rest });
      await prisma.userHistory.update({
        where: { id: history.id },
        data: { professionalLicense: { connect: { id: license.id } } },
      });
    } else {
      await prisma.license.update({ where: { id: id }, data: rest });
    }
  }
  if (caregiverCertifications.length) {
    await createOrUpdateMany(
      caregiverCertifications,
      "caregiverCertification",
      { userHistoryId: rest.id },
    );
  }
  const totalSize = media?.reduce(
    (acc: number, media: FileType) => acc + media.size,
    0,
  );
  if (totalSize > MAX_FILE_SIZE) {
    return ErrorResponse(
      "Total media size should not be greater than 25GB",
      400,
    );
  }
  await deleteMissingItems(media || [], "media", { userHistoryId: rest.id });
  if (media?.length) {
    await addNewMedia(media, "media", rest.id);
  }
  return ApiResponse(null, "User History updated successfully");
});

const deleteUserHistories = asyncWrapper(async (req: CustomRequest) => {
  const { ids, status: currentStatus } = await req.json();
  await prisma.userHistory.updateMany({
    where: {
      id: { in: ids },
      user: {
        UserProvider: { some: { providerId: req.user?.providerId as string } },
      },
    },
    data: {
      active: currentStatus === "active" ? false : true,
      archivedOn: currentStatus === "active" ? new Date() : null,
    },
  });
  return ApiResponse(
    null,
    `User History(s) ${currentStatus === "active" ? "archived" : "activated"} successfully`,
  );
});

const POST = handler(authorizeUser, createUserHistory);
const PUT = handler(
  authorizeUser,
  authorizeUpdateProvider("userHistory", "user"),
  updateUserHistory,
);
const DELETE = handler(authorizeUser, deleteUserHistories);

export { DELETE, POST, PUT };
