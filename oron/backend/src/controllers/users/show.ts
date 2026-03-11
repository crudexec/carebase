import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/User';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const show = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const id = req.user.id;

  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne(id, {
      select: ['id', 'first_name', 'last_name', 'email', 'role', 'created_at'],
    });
    if (!user) {
      const customError = new CustomError(404, 'General', `User with id:${id} not found.`, ['User not found.']);
      return next(customError);
    }
    res.customSuccess(200, 'User found', user);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
