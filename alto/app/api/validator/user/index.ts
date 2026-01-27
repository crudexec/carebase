import { NextResponse } from "next/server";

import { loginFormSchema } from "@/schema/auth/login";
import { ValidateParseResponse } from "@/types";

import { CustomRequest, validate } from "../../lib";
import { NextFunction } from "../../middlewares/handler";

export const validateLogin = async (
  req: CustomRequest,
  _res: NextResponse,
  next: NextFunction,
): Promise<NextResponse | void> => {
  const data = await req.clone().json();
  const response = loginFormSchema.safeParse(
    data,
  ) as unknown as ValidateParseResponse;
  return validate(response, next);
};
