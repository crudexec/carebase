import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeEmergencyContactInformation } from 'orm/entities/IntakeForm/emergencyContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveEmergencyContactInformation = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  const emergencyContactInformationRepository = getRepository(IntakeEmergencyContactInformation);
  const user_id = req.user.id;
  try {
    const emergencyContactInformation = await emergencyContactInformationRepository.findOne({ where: { user_id } });
    if (emergencyContactInformation) {
      return res.customSuccess(
        200,
        'Emergency Contact Information successfully retrieved.',
        emergencyContactInformation,
      );
    } else {
      return res.customSuccess(200, 'Emergency Contact Information has not been filled', null);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
