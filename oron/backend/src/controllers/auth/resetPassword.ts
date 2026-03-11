import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;
  const { token } = req.query;
  let jwtPayload: { [key: string]: any };

  const userRepository = getRepository(User);
  try {
    jwtPayload = jwt.verify(String(token), process.env.JWT_SECRET as string) as { [key: string]: any };
    ['iat', 'exp'].forEach((keyToRemove) => delete jwtPayload[keyToRemove]);

    if (!jwtPayload.email) {
      const customError = new CustomError(400, 'General', 'Token is invalid', [`Token is invalid.`]);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { email: jwtPayload.email } });

    user.password = password;
    user.hashPassword();
    await userRepository.update(user.id, user);

    return res.customSuccess(200, 'Password successfully reseted.');
  } catch (err) {
    const customError = new CustomError(401, 'Raw', 'JWT error', null, err);
    return next(customError);
  }
};
