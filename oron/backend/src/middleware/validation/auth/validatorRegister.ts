import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { ConstsUser } from 'consts/ConstsUser';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorRegister = (req: Request, res: Response, next: NextFunction) => {
  let { email, password, first_name, last_name } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  email = !email ? '' : email;
  password = !password ? '' : password;

  if (!validator.isEmail(email)) {
    errorsValidation.push({ email: 'Email is invalid' });
  }

  if (validator.isEmpty(email)) {
    errorsValidation.push({ email: 'Email is required' });
  }

  if (validator.isEmpty(password)) {
    errorsValidation.push({ password: 'Password is required' });
  }

  if (!first_name) {
    errorsValidation.push({ first_name: 'First name is required' });
  }

  if (!last_name) {
    errorsValidation.push({ last_name: 'Last name is required' });
  }

  if (!validator.isLength(password, { min: ConstsUser.PASSWORD_MIN_CHAR })) {
    errorsValidation.push({
      password: `Password must be at least ${ConstsUser.PASSWORD_MIN_CHAR} characters`,
    });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Register validation error', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
