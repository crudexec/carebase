import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MedicalInformation } from 'orm/entities/IntakeForm/medicalInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveMedicalInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const medicalInformationRepository = getRepository(MedicalInformation);
    const medicalInformation = await medicalInformationRepository.findOne({ where: { user_id } });

    if (!medicalInformation) {
      return res.customSuccess(200, 'Medical Information has not been filled', null);
    }
    return res.customSuccess(200, 'Medical Information successfully retrieved.', medicalInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error', null, err);
    return next(customError);
  }
};
