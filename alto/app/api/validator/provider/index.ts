import { NextResponse } from "next/server";

import { providerSchema } from "@/schema/settings/provider";
import { ValidateParseResponse } from "@/types";

import { CustomRequest, validate } from "../../lib";
import { NextFunction } from "../../middlewares/handler";

export const validateUpdateProvider = async (
  req: CustomRequest,
  _res: NextResponse,
  next: NextFunction,
): Promise<NextResponse | void> => {
  const data = await req.clone().json();
  const response = providerSchema.safeParse(data) as ValidateParseResponse;
  return validate(response, next);
};
