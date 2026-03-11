import { Request, Response, NextFunction } from 'express';

import { CitizenshipStatus } from 'types/genericEnums';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorCreateCitizenship = (req: Request, res: Response, next: NextFunction) => {
  const { citizenship_status } = req.body;

  const errorsValidation: ErrorValidation[] = [];

  if (!citizenship_status) {
    errorsValidation.push({ citizenship_status: 'Citizenship status is required' });
  }

  if (!Object.values(CitizenshipStatus).includes(citizenship_status)) {
    errorsValidation.push({
      citizenship_status: `Invalid citizenship status ${JSON.stringify(CitizenshipStatus)} are available`,
    });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(
      400,
      'Validation',
      ' Citizenship Creation Failed!',
      null,
      null,
      errorsValidation,
    );
    return next(customError);
  }
  return next();
};
