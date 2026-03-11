import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeEmergencyContactInformation } from 'orm/entities/IntakeForm/emergencyContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addEmergencyContactInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const {
    first_name,
    last_name,
    relationship,
    email,
    street_number_and_house_address,
    country,
    state,
    city,
    zip_code,
    apartment_number,
    phone,
    home_phone_number,
    work_phone_number,
  } = req.body;

  try {
    const emergencyContactInformationRepository = getRepository(IntakeEmergencyContactInformation);
    const user_id = req.user.id;

    const newEmergencyContactInformation = new IntakeEmergencyContactInformation();
    newEmergencyContactInformation.first_name = first_name;
    newEmergencyContactInformation.last_name = last_name;
    newEmergencyContactInformation.relationship = relationship;
    newEmergencyContactInformation.email = email;
    newEmergencyContactInformation.street_number_and_house_address = street_number_and_house_address;
    newEmergencyContactInformation.country = country;
    newEmergencyContactInformation.state = state;
    newEmergencyContactInformation.city = city;
    newEmergencyContactInformation.zip_code = zip_code;
    newEmergencyContactInformation.apartment_number = apartment_number;
    newEmergencyContactInformation.phone = phone;
    newEmergencyContactInformation.home_phone_number = home_phone_number;
    newEmergencyContactInformation.work_phone_number = work_phone_number;
    newEmergencyContactInformation.registered_by = user_id;

    const savedEmergencyContactInformation = await emergencyContactInformationRepository.save(
      newEmergencyContactInformation,
    );
    return res.customSuccess(
      200,
      'Emergency Contact Information successfully created.',
      savedEmergencyContactInformation,
    );
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
