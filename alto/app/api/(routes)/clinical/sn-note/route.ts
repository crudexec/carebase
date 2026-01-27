import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";
import { getSkilledNursingNotes } from "./helper";

const fetchSkilledNursingNotes = async (req: CustomRequest) => {
  const { patientId, status } = getQuery(req);
  const snNotes = await getSkilledNursingNotes(patientId, status);
  return ApiResponse(snNotes);
};

const deleteSkilledNursingNotes = asyncWrapper(async (req: CustomRequest) => {
  const { ids, status: currentStatus } = await req.json();
  await prisma.skilledNursingNote.updateMany({
    where: {
      id: { in: ids || [] },
      providerId: req.user?.providerId as string,
    },
    data: {
      active: currentStatus === "active" ? false : true,
      archivedOn: currentStatus === "active" ? new Date() : null,
    },
  });
  return ApiResponse(
    null,
    `Skilled note(s) ${currentStatus === "active" ? "archived" : "restored"} successfully`,
  );
});

const GET = handler(authorizeUser, asyncWrapper(fetchSkilledNursingNotes));
const DELETE = handler(authorizeUser, deleteSkilledNursingNotes);

export { DELETE, GET };
