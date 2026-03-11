import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Role, UserStatus } from 'orm/entities/types';
import { User } from 'orm/entities/User';
import { JwtPayload } from 'types/JwtPayload';
import { createJwtToken } from 'utils/createJwtToken';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  let { email } = req.body;
  const { password } = req.body;

  email = email.toLowerCase().trim();

  const userRepository = getRepository(User);
  try {
    const users = await userRepository.find();
    const user = await userRepository.findOne({ where: { email, deleted_at: null } });

    if (!user) {
      const customError = new CustomError(404, 'General', 'User Not Found', ['Incorrect email or password']);
      return next(customError);
    }

    if (!user.checkIfPasswordMatch(password)) {
      const customError = new CustomError(404, 'General', 'Incorrect email or password', [
        'Incorrect email or password',
      ]);
      return next(customError);
    }

    // Check if user status allows login
    if (user.status === UserStatus.INACTIVE || user.status === UserStatus.DISENGAGED) {
      const customError = new CustomError(403, 'General', 'Account access restricted', [
        'Your account is currently inactive. Please contact an administrator for assistance.',
      ]);
      return next(customError);
    }

    const jwtPayload: JwtPayload = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      account_id: user.account_id,
      email: user.email,
      role: user.role as Role,
      created_at: user.created_at,
    };

    try {
      const token = createJwtToken(jwtPayload);
      res.customSuccess(200, 'Token successfully created.', `Bearer ${token}`);
    } catch (err) {
      const customError = new CustomError(400, 'Raw', "Token can't be created", null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
