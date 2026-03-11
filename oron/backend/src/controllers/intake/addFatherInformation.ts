import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { FatherContactInformation } from 'orm/entities/IntakeForm/fatherContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addFatherInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
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
  const fatherContactInformationRepository = getRepository(FatherContactInformation);
  const user_id = req.user.id;
  try {
    const newFatherContactInformation = new FatherContactInformation();
    newFatherContactInformation.first_name = first_name;
    newFatherContactInformation.last_name = last_name;
    newFatherContactInformation.relationship = relationship;
    newFatherContactInformation.email = email;
    newFatherContactInformation.street_number_and_house_address = street_number_and_house_address;
    newFatherContactInformation.country = country;
    newFatherContactInformation.state = state;
    newFatherContactInformation.city = city;
    newFatherContactInformation.zip_code = zip_code;
    newFatherContactInformation.apartment_number = apartment_number;
    newFatherContactInformation.phone = phone;
    newFatherContactInformation.home_phone_number = home_phone_number;
    newFatherContactInformation.work_phone_number = work_phone_number;
    newFatherContactInformation.registered_by = user_id;
    const savedFatherInformation = await fatherContactInformationRepository.save(newFatherContactInformation);
    return res.customSuccess(200, 'Father Contact Information successfully created.', savedFatherInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
