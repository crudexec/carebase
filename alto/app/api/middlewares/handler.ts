import { NextResponse } from "next/server";

import { CustomRequest, ErrorResponse, ParamProps } from "../lib";

export type NextFunction = () => void;
export type Middleware = (
  req: CustomRequest,
  res: NextResponse & ParamProps,
  next: NextFunction,
) => Promise<NextResponse | void>;

async function execMiddleware(
  middleware: Middleware[],
  request: CustomRequest,
  res: NextResponse & ParamProps,
) {
  for (const middlewareFn of middleware) {
    let nextInvoked = false;
    const next = async () => {
      nextInvoked = true;
    };
    const result = await middlewareFn(request, res, next);
    if (!nextInvoked) {
      return result;
    }
  }
  return null;
}

export const handler =
  (...middleware: Middleware[]) =>
  async (request: CustomRequest, res: NextResponse & ParamProps) => {
    const result = await execMiddleware(middleware, request, res);
    if (result) {
      return result;
    }
    return ErrorResponse(
      "Your handler or middleware must return a NextResponse!",
      400,
    );
  };
