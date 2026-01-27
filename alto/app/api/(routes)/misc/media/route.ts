import { ApiResponse, asyncWrapper, CustomRequest } from "@/app/api/lib";
import { authorizeUser, handler } from "@/app/api/middlewares";
import prisma from "@/prisma";

const deleteMedia = async (req: CustomRequest) => {
  const data = await req.json();
  const { mediaId } = data;
  const media = await prisma.media.delete({ where: { id: mediaId } });
  return ApiResponse(media, "Media delete");
};
const DELETE = handler(authorizeUser, asyncWrapper(deleteMedia));

export { DELETE };
