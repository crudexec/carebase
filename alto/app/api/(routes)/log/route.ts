import { ApiResponse, asyncWrapper, CustomRequest, getQuery } from "../../lib";
import { authorizeUser, handler } from "../../middlewares";
import { createLog, fetchLogs } from "./helper";

const fetchLogsHandler = asyncWrapper(async (req: CustomRequest) => {
  const { contextId } = getQuery(req);
  const providerId = req.user?.providerId as string;
  const logs = await fetchLogs(contextId, providerId);
  return ApiResponse(logs);
});

const createLogHandler = asyncWrapper(async (req: CustomRequest) => {
  const body = await req.json();
  const providerId = req.user?.providerId as string;
  await createLog(body.context, body.text, body.contextId, providerId);
});

const GET = handler(authorizeUser, fetchLogsHandler);
const POST = handler(authorizeUser, createLogHandler);

export { GET, POST };
