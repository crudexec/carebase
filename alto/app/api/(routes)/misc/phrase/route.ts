import { Phrase } from "@prisma/client";

import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const createPhrase = asyncWrapper(async (req: CustomRequest) => {
  const body = (await req.json()) as Phrase;
  const phrase = await prisma.phrase.create({
    data: body,
  });
  return ApiResponse(phrase, "Phrase created successfully");
});

const POST = handler(authorizeUser, createPhrase);

export { POST };
