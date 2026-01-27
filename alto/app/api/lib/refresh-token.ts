import { isEmpty } from "lodash";

import {
  CustomRequest,
  handleTokenError,
  logout,
  refreshAuthToken,
  verifyToken,
} from "./util";
export const REFRESH_SECRET = process.env.REFRESH_SECRET || "";

export const refreshToken = async (
  req: CustomRequest,
  refreshToken: string,
) => {
  try {
    const user = await verifyToken(refreshToken, REFRESH_SECRET);
    if (!isEmpty(user)) {
      req.user = user;
      refreshAuthToken({
        id: user.id,
        providerId: user.providerId as string,
      });
    }
  } catch (error) {
    logout();
    return handleTokenError(error);
  }
};
