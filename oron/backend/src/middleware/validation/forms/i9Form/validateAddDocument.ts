import { Request, Response, NextFunction } from 'express';

import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorAddDocument = (req: Request, res: Response, next: NextFunction) => {
  const errorsValidation: ErrorValidation[] = [];

  if (req.body.documentData.length === 0) {
    errorsValidation.push({ documentData: 'Document data is required' });
  }

  for (let i = 0; i < req.body.documentData.length; i++) {
    const { title, issuing_authority, document_number, file_url, expiration_date } = req.body.documentData[i];
    if (!title) {
      errorsValidation.push({ title: 'Title is required' });
    }

    if (!issuing_authority) {
      errorsValidation.push({ issuing_authority: 'Issuing authority is required' });
    }

    if (!file_url) {
      errorsValidation.push({ file_url: 'File url is required' });
    }
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Document Creation Failed!', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
