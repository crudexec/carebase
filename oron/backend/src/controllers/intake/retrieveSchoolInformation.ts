import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { SchoolContactInformation } from 'orm/entities/IntakeForm/schoolContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveSchoolContactInformation = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schoolContactInformationRepository = getRepository(SchoolContactInformation);
    const user_id = req.user.id;
    const schoolContactInformation = await schoolContactInformationRepository.findOne({ where: { user_id } });
    if (schoolContactInformation) {
      return res.customSuccess(200, 'School Contact Information successfully retrieved.', schoolContactInformation);
    } else {
      return res.customSuccess(200, 'School Contact Information has not been filled', null);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error', null, err);
    return next(customError);
  }
};
