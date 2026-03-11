import { Request, Response, NextFunction } from 'express';

import { JwtPayload } from 'types/JwtPayload';

import { Role } from '../orm/entities/types';
import { CustomError } from '../utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const checkRole = (roles: string | string[], isSelfAllowed = false) => {
  return async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
    const { id, role } = req.user;
    const { id: requestId } = req.params;

    let errorSelfAllowed: string | null = null;
    if (isSelfAllowed) {
      if (id === requestId) {
        return next();
      }
      errorSelfAllowed = 'Self allowed action.';
    }

    // Support both string and array of roles
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const hasPermission = Array.isArray(roles)
      ? allowedRoles.includes(role)
      : roles.indexOf(role) !== -1;

    if (!hasPermission) {
      const errors = [
        'Unauthorized - Insufficient user rights',
        `Current role: ${role}. Required role: ${allowedRoles.join(', ')}`,
      ];
      if (errorSelfAllowed) {
        errors.push(errorSelfAllowed);
      }
      const customError = new CustomError(401, 'Unauthorized', 'Unauthorized - Insufficient user rights', errors);
      return next(customError);
    }
    return next();
  };
};
