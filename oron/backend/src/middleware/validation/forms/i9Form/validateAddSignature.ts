import { Request, Response, NextFunction } from 'express';

import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorAddSignature = (req: Request, res: Response, next: NextFunction) => {
  const { signature_data } = req.body;

  const errorsValidation: ErrorValidation[] = [];

  if (!signature_data) {
    errorsValidation.push({ signature_data: 'Signature data is required' });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Signature Creation Failed!', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
