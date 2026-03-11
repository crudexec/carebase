import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/User';
import { JwtPayload } from 'types/JwtPayload';
import { createJwtToken } from 'utils/createJwtToken';
import { SendForgotPasswordEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user;
}

export const forgotPassword = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { email } = req.body;

  try {
    const userRepository = getRepository(User);

    email = email.toLowerCase().trim();

    const user = await userRepository.findOne({ where: { email, deleted_at: null } });

    if (!user) {
      const customError = new CustomError(404, 'General', 'User Not Found', ['User not found']);
      return next(customError);
    }

    const jwtPayload: JwtPayload = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      account_id: user.account_id,
      role: user.role,
      created_at: user.created_at,
    };

    const token = createJwtToken(jwtPayload);

    const resetLink = `${process.env.FRONTEND_URL}/create-new-password?token=${token}`;

    await SendForgotPasswordEmail(user.first_name, resetLink, user.email);

    return res.customSuccess(200, 'Forgot password email sent.', user);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `Can't send forgot password`, null, err);
    return next(customError);
  }
};
