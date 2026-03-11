import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ClientInformation } from 'orm/entities/IntakeForm/clientInformation';
import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addClientInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    state,
    sex,
    race_or_ethinicity,
    country,
    social_security_number,
    medicaid_number,
    city,
    county,
    zip_code,
    address_or_street,
    apartment_number,
    intake_full_id,
  } = req.body;
  const clientInformationRepository = getRepository(ClientInformation);
  const intakeFullFormRepository = getRepository(IntakeFullForm);
  const user_id = req.user.id;

  try {
    if (social_security_number && social_security_number.length !== 9) {
      const customError = new CustomError(400, 'General', 'Social Security Number must be 9 digits', [
        `SSN must be 9 digits`,
      ]);
      return next(customError);
    }

    const newClientInformation = new ClientInformation();
    newClientInformation.first_name = first_name;
    newClientInformation.last_name = last_name;
    newClientInformation.date_of_birth = date_of_birth;
    newClientInformation.state = state;
    newClientInformation.country = country;
    newClientInformation.sex = sex;
    newClientInformation.race_or_ethinicity = race_or_ethinicity;
    newClientInformation.social_security_number = social_security_number;
    newClientInformation.medicaid_number = medicaid_number;
    newClientInformation.registered_by = user_id;
    newClientInformation.city = city;
    newClientInformation.county = county;
    newClientInformation.zip_code = zip_code;
    newClientInformation.address_or_street = address_or_street;
    newClientInformation.apartment_number = apartment_number;
    const savedClientInformation = await clientInformationRepository.save(newClientInformation);

    if (savedClientInformation) {
      const alreadyExistIntakeFullForm = await intakeFullFormRepository.findOne({
        where: { id: intake_full_id, deleted_at: null },
      });
      const newIntakeFullForm = new IntakeFullForm();

      if (alreadyExistIntakeFullForm) {
        newIntakeFullForm.client_information_id = savedClientInformation.id;
        await intakeFullFormRepository.update(alreadyExistIntakeFullForm.id, newIntakeFullForm);
      }
    }
    return res.customSuccess(200, 'Client Information successfully created.', savedClientInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
