import { authorizeGetProvider } from "@/app/api/middlewares/auth";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { getSkilledNursingNote } from "../helper";

type ParamProps = { params: { id: string } };

const skilledNotesHandler = async (
  req: CustomRequest,
  { params: { id } }: ParamProps,
) => {
  const snNote = await getSkilledNursingNote(
    id,
    req.user?.providerId as string,
  );
  return ApiResponse(snNote);
};

const GET = handler(
  authorizeUser,
  authorizeGetProvider("skilledNursingNote"),
  asyncWrapper(skilledNotesHandler),
);

export { GET };
