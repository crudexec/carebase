import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ReferenceForm } from 'orm/entities/ReferenceForm/reference';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveReferenceForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const referenceFormRepository = getRepository(ReferenceForm);

    const referenceForm = await referenceFormRepository.findOne({ where: { user_id } });

    if (!referenceForm) {
      const customError = new CustomError(400, 'General', 'Reference form does not exist', [
        `Reference form does not exist`,
      ]);
      return next(customError);
    }

    return res.customSuccess(200, 'Reference form successfully retrieved.', referenceForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error while retrieving reference form', null, err);
    return next(customError);
  }
};
