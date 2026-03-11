import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { FatherContactInformation } from 'orm/entities/IntakeForm/fatherContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editFatherInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let {
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
  const form_id = req.params.form_id;
  try {
    const motherInformation = await fatherContactInformationRepository.findOne({ where: { id: form_id } });
    if (!motherInformation) {
      const customError = new CustomError(400, 'General', 'Father Contact Information does not exist', [
        `Father Contact Information does not exist`,
      ]);
      return next(customError);
    }

    first_name = first_name ?? motherInformation.first_name;
    last_name = last_name ?? motherInformation.last_name;
    relationship = relationship ?? motherInformation.relationship;
    email = email ?? motherInformation.email;
    street_number_and_house_address =
      street_number_and_house_address ?? motherInformation.street_number_and_house_address;
    country = country ?? motherInformation.country;
    state = state ?? motherInformation.state;
    city = city ?? motherInformation.city;
    zip_code = zip_code ?? motherInformation.zip_code;
    apartment_number = apartment_number ?? motherInformation.apartment_number;
    phone = phone ?? motherInformation.phone;
    home_phone_number = home_phone_number ?? motherInformation.home_phone_number;
    work_phone_number = work_phone_number ?? motherInformation.work_phone_number;

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

    await fatherContactInformationRepository.update({ id: motherInformation.id }, newFatherContactInformation);

    return res.customSuccess(200, 'Father Contact Information successfully updated.', newFatherContactInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
