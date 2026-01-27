import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { CustomRequest, ErrorResponse, logger } from ".";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asyncWrapper(handler: any) {
  return async (req: CustomRequest, res: NextResponse) => {
    try {
      const resp = await handler(req, res);
      return resp;
    } catch (error) {
      logger("api-private-wrapper-error", { error });
      if (error?.isApiException) {
        const { message, statusCode, data } = error;
        return ErrorResponse(message, statusCode, data);
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return ErrorResponse(
            (error && error.meta && Array.isArray(error.meta.target)
              ? error.meta.target
              : []
            )
              .map((value) => String(value))
              .join(", ") + " already exists",
          );
        } else {
          return ErrorResponse(
            error?.meta?.cause ||
              error?.meta?.target ||
              "Internal Server Error",
            500,
          );
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        if (error?.message.includes("Invalid value for argument")) {
          const errorMessage = error.message
            .split("Invalid value for argument")[1]
            .trim()
            ?.split(".")[0];
          return ErrorResponse(
            "Invalid value for" + errorMessage + " field",
            400,
          );
        } else {
          return ErrorResponse("Internal Server Error", 500);
        }
      } else {
        return ErrorResponse("Internal Server Error", 500);
      }
    }
  };
}
