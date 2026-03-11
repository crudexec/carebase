import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MotherContactInformation } from 'orm/entities/IntakeForm/motherContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addMotherInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
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
  const motherInformationRepository = getRepository(MotherContactInformation);
  const user_id = req.user.id;
  try {
    const newMotherInformation = new MotherContactInformation();
    newMotherInformation.first_name = first_name;
    newMotherInformation.last_name = last_name;
    newMotherInformation.relationship = relationship;
    newMotherInformation.email = email;
    newMotherInformation.street_number_and_house_address = street_number_and_house_address;
    newMotherInformation.country = country;
    newMotherInformation.state = state;
    newMotherInformation.city = city;
    newMotherInformation.zip_code = zip_code;
    newMotherInformation.apartment_number = apartment_number;
    newMotherInformation.phone = phone;
    newMotherInformation.home_phone_number = home_phone_number;
    newMotherInformation.work_phone_number = work_phone_number;
    newMotherInformation.registered_by = user_id;
    const savedMotherInformation = await motherInformationRepository.save(newMotherInformation);
    return res.customSuccess(200, 'Mother Information successfully created.', savedMotherInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
