import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/User';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

import { Role } from '../../orm/entities/types';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fetchAllEmployeesForSchedule = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const account_id = req.user.account_id;

    const userRepository = getRepository(User);

    const users = await userRepository.find({ where: { account_id, role: Role.STANDARD, deleted_at: null } });

    return res.customSuccess(200, 'Employees Retrieved Successfully', users);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Retrieving Employees', null, err);
    return next(customError);
  }
};
