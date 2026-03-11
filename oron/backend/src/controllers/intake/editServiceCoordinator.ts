import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ServiceCoordinatorInformation } from 'orm/entities/IntakeForm/serviceCoordinatorInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editServiceCoordinatorInformation = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  let { full_name, email, phone, country, fax_number } = req.body;
  try {
    const serviceCoordinatorInformationRepository = getRepository(ServiceCoordinatorInformation);
    const user_id = req.user.id;
    const form_id = req.params.form_id;

    const serviceCoordinatorInformation = await serviceCoordinatorInformationRepository.findOne({
      where: { id: form_id },
    });
    if (!serviceCoordinatorInformation) {
      const customError = new CustomError(400, 'General', 'Service Coordinator Information already exists', [
        `Service Coordinator Information already exists`,
      ]);
      return next(customError);
    }

    full_name = full_name ?? serviceCoordinatorInformation.full_name;
    email = email ?? serviceCoordinatorInformation.email;
    phone = phone ?? serviceCoordinatorInformation.phone;
    country = country ?? serviceCoordinatorInformation.country;
    fax_number = fax_number ?? serviceCoordinatorInformation.fax_number;

    const updatedServiceCoordinatorInformation = new ServiceCoordinatorInformation();
    updatedServiceCoordinatorInformation.full_name = full_name;
    updatedServiceCoordinatorInformation.email = email;
    updatedServiceCoordinatorInformation.phone = phone;
    updatedServiceCoordinatorInformation.country = country;
    updatedServiceCoordinatorInformation.fax_number = fax_number;

    await serviceCoordinatorInformationRepository.update(
      { id: serviceCoordinatorInformation.id },
      updatedServiceCoordinatorInformation,
    );

    return res.customSuccess(
      200,
      'Service Coordinator Information successfully updated.',
      updatedServiceCoordinatorInformation,
    );
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Service Coordinator', null, err);
    return next(customError);
  }
};
