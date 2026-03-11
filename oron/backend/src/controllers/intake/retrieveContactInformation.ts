import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeEmergencyContactInformation } from 'orm/entities/IntakeForm/emergencyContactInformation';
import { FatherContactInformation } from 'orm/entities/IntakeForm/fatherContactInformation';
import { MotherContactInformation } from 'orm/entities/IntakeForm/motherContactInformation';
import { SchoolContactInformation } from 'orm/entities/IntakeForm/schoolContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveContactInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const fatherContactInformationRepository = getRepository(FatherContactInformation);
  const motherInformationRepository = getRepository(MotherContactInformation);
  const emergencyContactInformationRepository = getRepository(IntakeEmergencyContactInformation);
  const schoolContactInformationRepository = getRepository(SchoolContactInformation);
  const user_id = req.user.id;
  try {
    const savedFatherInformation = (await fatherContactInformationRepository.findOne({ where: { user_id } })) || {};
    const savedMotherInformation = (await motherInformationRepository.findOne({ where: { user_id } })) || {};
    const savedEmergencyContactInformation =
      (await emergencyContactInformationRepository.findOne({
        where: { user_id },
      })) || {};
    const savedSchoolContactInformation =
      (await schoolContactInformationRepository.findOne({ where: { user_id } })) || {};

    return res.customSuccess(200, 'Father Contact Information successfully retrieved.', {
      father: savedFatherInformation,
      mother: savedMotherInformation,
      emergency: savedEmergencyContactInformation,
      school: savedSchoolContactInformation,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error retrieving contact information', null, err);
    return next(customError);
  }
};
