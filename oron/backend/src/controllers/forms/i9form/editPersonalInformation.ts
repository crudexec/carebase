import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PersonalInformation } from 'orm/entities/i9Form/personalInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editPersonalInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let {
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    state,
    zip_code,
    middle_name,
    other_last_name,
    social_security_number,
    apartment_number,
  } = req.body;
  const personalInformationRepository = getRepository(PersonalInformation);
  const user_id = req.user.id;

  try {
    const personalInformation = await personalInformationRepository.findOne({ where: { user_id } });
    if (personalInformation) {
      first_name = first_name ?? personalInformation.first_name;
      last_name = last_name ?? personalInformation.last_name;
      email = email ?? personalInformation.email;
      phone = phone ?? personalInformation.phone;
      address = address ?? personalInformation.address;
      city = city ?? personalInformation.city;
      state = state ?? personalInformation.state;
      zip_code = zip_code ?? personalInformation.zip_code;
      middle_name = middle_name ?? personalInformation.middle_name;
      other_last_name = other_last_name ?? personalInformation.other_last_name;
      social_security_number = social_security_number ?? personalInformation.social_security_number;
      apartment_number = apartment_number ?? personalInformation.apartment_number;

      if (social_security_number !== personalInformation.social_security_number) {
        const ssnExists = await personalInformationRepository.findOne({ where: { social_security_number } });
        if (ssnExists) {
          const customError = new CustomError(400, 'General', 'This Social Security Number already exists', [
            `SSN already exists`,
          ]);
          return next(customError);
        }
      }

      const newPersonalInformation = new PersonalInformation();

      newPersonalInformation.first_name = first_name;
      newPersonalInformation.last_name = last_name;
      newPersonalInformation.email = email;
      newPersonalInformation.phone = phone;
      newPersonalInformation.address = address;
      newPersonalInformation.city = city;
      newPersonalInformation.state = state;
      newPersonalInformation.zip_code = zip_code;
      newPersonalInformation.middle_name = middle_name;
      newPersonalInformation.other_last_name = other_last_name;
      newPersonalInformation.social_security_number = social_security_number;
      newPersonalInformation.apartment_number = apartment_number;

      await personalInformationRepository.update(personalInformation.id, newPersonalInformation);

      return res.customSuccess(
        200,
        'User personal information successfully created for the i9 form.',
        newPersonalInformation,
      );
    } else {
      const customError = new CustomError(400, 'General', 'User personal information does not exist for the i9 form', [
        `Bio Data does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
