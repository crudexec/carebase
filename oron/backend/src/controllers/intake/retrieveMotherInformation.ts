import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MotherContactInformation } from 'orm/entities/IntakeForm/motherContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveMotherInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const motherInformationRepository = getRepository(MotherContactInformation);
  const user_id = req.user.id;

  try {
    const motherInformation = await motherInformationRepository.findOne({ where: { user_id } });
    if (motherInformation) {
      return res.customSuccess(200, 'Mother Contact Information successfully retrieved.', motherInformation);
    } else {
      return res.customSuccess(200, 'Mother Contact Information has not been filled', null);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
