import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { I9Form } from 'orm/entities/i9Form/i9form';
import { PersonalInformation } from 'orm/entities/i9Form/personalInformation';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fillPersonalInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const {
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
  const i9FormRepository = getRepository(I9Form);
  const user_id = req.user.id;

  try {
    const ssnExists = await personalInformationRepository.findOne({ where: { social_security_number } });

    if (social_security_number.length !== 9) {
      const customError = new CustomError(400, 'General', 'Social Security Number must be 9 digits', [
        `SSN must be 9 digits`,
      ]);
      return next(customError);
    }

    if (ssnExists) {
      const customError = new CustomError(400, 'General', 'This Social Security Number already exists', [
        `SSN already exists`,
      ]);
      return next(customError);
    }

    const personalInformation = await personalInformationRepository.findOne({ where: { user_id } });
    if (personalInformation) {
      const customError = new CustomError(400, 'General', 'User personal information already exists for the i9 form', [
        `Bio Data already exists`,
      ]);
      return next(customError);
    }
    const newpersonalInformation = new PersonalInformation();
    newpersonalInformation.email = email;
    newpersonalInformation.first_name = first_name;
    newpersonalInformation.last_name = last_name;
    newpersonalInformation.middle_name = middle_name;
    newpersonalInformation.other_last_name = other_last_name;
    newpersonalInformation.phone = phone;
    newpersonalInformation.address = address;
    newpersonalInformation.city = city;
    newpersonalInformation.state = state;
    newpersonalInformation.zip_code = zip_code;
    newpersonalInformation.user_id = user_id;
    newpersonalInformation.social_security_number = social_security_number;
    newpersonalInformation.apartment_number = apartment_number;

    const savedPersonalInformation = await personalInformationRepository.save(newpersonalInformation);
    if (savedPersonalInformation) {
      const i9Form = await i9FormRepository.findOne({ where: { owner: user_id } });
      if (i9Form) {
        i9Form.personal_information_id = savedPersonalInformation.id;
        i9Form.status = Status.IN_PROGRESS;
        await i9FormRepository.save(i9Form);
      } else {
        const newI9Form = new I9Form();
        newI9Form.owner = user_id;
        newI9Form.personal_information_id = savedPersonalInformation.id;
        newI9Form.status = Status.IN_PROGRESS;
        await i9FormRepository.save(newI9Form);
      }
    }
    return res.customSuccess(
      200,
      'User personal information successfully created for the i9 form.',
      savedPersonalInformation,
    );
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
