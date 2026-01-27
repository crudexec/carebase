import { ALLOWED_CONTENT_TYPES, ALLOWED_OBJECT_TYPES } from "@/constants";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  ErrorResponse,
  getSignedURL,
  logger,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const getPresignedURL = asyncWrapper(async (req: CustomRequest) => {
  const user = req.user;
  const body = await req.json();
  const { fileName, fileType } = body;

  if (
    !ALLOWED_CONTENT_TYPES.includes(fileType) ||
    !ALLOWED_OBJECT_TYPES.includes(
      fileName.substring(0, fileName.lastIndexOf("/")),
    )
  ) {
    logger("upload", {
      method: req.method,
      message: "Invalid file type",
      body,
    });
    return ErrorResponse("Invalid file or file type", 400);
  }

  if (!fileName || !fileType) {
    logger("upload", {
      method: req.method,
      message: "Missing file or fileType",
      body,
    });
    return ErrorResponse("Missing file or file type", 400);
  }

  const preSignedUrl = await getSignedURL(
    fileName,
    user?.providerId as string,
    fileType,
  );

  return ApiResponse({ preSignedUrl });
});
export const POST = handler(authorizeUser, getPresignedURL);
