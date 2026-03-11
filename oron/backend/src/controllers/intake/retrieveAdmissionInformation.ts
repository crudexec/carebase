import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { AdmissionInformation } from 'orm/entities/IntakeForm/admissionInformation';
import { WaiverServices } from 'orm/entities/IntakeForm/waiverService';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveAdmissionInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const admissionInformationRepository = getRepository(AdmissionInformation);
    const waiverServicesRepository = getRepository(WaiverServices);

    const admissionInformation = await admissionInformationRepository.findOne({ where: { user_id } });
    const waiverServices = await waiverServicesRepository.find({ where: { user_id } });

    return res.customSuccess(200, 'Admission Information successfully retrieved.', {
      admissionInformation,
      waiverServices,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
