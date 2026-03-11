import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ServiceCoordinatorInformation } from 'orm/entities/IntakeForm/serviceCoordinatorInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveServiceCoordinatorInformation = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  try {
    const serviceCoordinatorInformationRepository = getRepository(ServiceCoordinatorInformation);
    const user_id = req.user.id;

    const serviceCoordinatorInformation = await serviceCoordinatorInformationRepository.findOne({ where: { user_id } });
    if (!serviceCoordinatorInformation) {
      return res.customSuccess(200, 'Service Coordinator Information has not been filled', null);
    }

    return res.customSuccess(
      200,
      'Service Coordinator Information successfully retrieved.',
      serviceCoordinatorInformation,
    );
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Retrieving Service Coordinator', null, err);
    return next(customError);
  }
};
