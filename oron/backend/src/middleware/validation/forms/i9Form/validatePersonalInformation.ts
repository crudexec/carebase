import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorCreatePersonalInformation = (req: Request, res: Response, next: NextFunction) => {
  const { first_name, last_name, email, phone, address, city, state, zip_code } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  if (!first_name) {
    errorsValidation.push({ first_name: 'First name is required' });
  }

  if (!last_name) {
    errorsValidation.push({ last_name: 'Last name is required' });
  }

  if (!email && validator.isEmail(email)) {
    errorsValidation.push({ email: 'Email is required' });
  }

  if (!phone) {
    errorsValidation.push({ phone: 'Phone is required' });
  }

  if (!address) {
    errorsValidation.push({ address: 'Address is required' });
  }

  if (!city) {
    errorsValidation.push({ city: 'City is required' });
  }

  if (!state) {
    errorsValidation.push({ state: 'State is required' });
  }

  if (!zip_code) {
    errorsValidation.push({ zip_code: 'Zip code is required' });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Register validation error', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
