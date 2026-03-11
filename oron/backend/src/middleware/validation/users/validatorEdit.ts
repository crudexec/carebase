import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorEdit = async (req: Request, res: Response, next: NextFunction) => {
  let { first_name, last_name, email } = req.body;
  const errorsValidation: ErrorValidation[] = [];
  const userRepository = getRepository(User);

  first_name = !first_name ? '' : first_name;
  last_name = !last_name ? '' : last_name;

  const user = await userRepository.findOne({ email });
  if (user) {
    errorsValidation.push({ username: `Username ${email} already exists` });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Edit user validation error', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
