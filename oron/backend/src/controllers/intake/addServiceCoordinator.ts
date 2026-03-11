import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { ServiceCoordinatorInformation } from 'orm/entities/IntakeForm/serviceCoordinatorInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addServiceCoordinatorInformation = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  const { full_name, email, phone, country, fax_number, emergency_contact_information_id, intake_full_id } = req.body;
  try {
    const serviceCoordinatorInformationRepository = getRepository(ServiceCoordinatorInformation);
    const intakeFullFormRepository = getRepository(IntakeFullForm);
    const user_id = req.user.id;

    const newServiceCoordinatorInformation = new ServiceCoordinatorInformation();
    newServiceCoordinatorInformation.full_name = full_name;
    newServiceCoordinatorInformation.email = email;
    newServiceCoordinatorInformation.phone = phone;
    newServiceCoordinatorInformation.country = country;
    newServiceCoordinatorInformation.fax_number = fax_number;
    newServiceCoordinatorInformation.registered_by = user_id;

    const savedServiceCoordinatorInformation = await serviceCoordinatorInformationRepository.save(
      newServiceCoordinatorInformation,
    );

    if (savedServiceCoordinatorInformation) {
      const newIntakeFullForm = new IntakeFullForm();

      const alreadyExistingIntakeFullForm = await intakeFullFormRepository.findOne({
        where: { id: intake_full_id, deleted_at: null },
      });

      if (alreadyExistingIntakeFullForm) {
        newIntakeFullForm.service_coordinator_information_id = savedServiceCoordinatorInformation.id;
        await intakeFullFormRepository.update(alreadyExistingIntakeFullForm.id, newIntakeFullForm);
      }
    }

    return res.customSuccess(
      200,
      'Service Coordinator Information successfully created.',
      savedServiceCoordinatorInformation,
    );
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Service Coordinator', null, err);
    return next(customError);
  }
};
