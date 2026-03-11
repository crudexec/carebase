import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { EmployeePersonalInformation } from 'orm/entities/EmployeeDemographicForm/personalInformation';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addPersonalInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    home_phone_number,
    street_address,
    gender,
    race_or_ethinicity,
    phone,
    city,
    state,
    zip_code,
    social_security_number,
  } = req.body;
  const personalInformationRepository = getRepository(EmployeePersonalInformation);
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
      const customError = new CustomError(400, 'General', 'Employee Demographic personal information already exists', [
        `Demographic data already exists`,
      ]);
      return next(customError);
    }
    const newpersonalInformation = new EmployeePersonalInformation();
    newpersonalInformation.first_name = first_name;
    newpersonalInformation.last_name = last_name;
    newpersonalInformation.date_of_birth = date_of_birth;
    newpersonalInformation.home_phone_number = home_phone_number;
    newpersonalInformation.phone = phone;
    newpersonalInformation.city = city;
    newpersonalInformation.race_or_ethinicity = race_or_ethinicity;
    newpersonalInformation.gender = gender;
    newpersonalInformation.state = state;
    newpersonalInformation.street_address = street_address;
    newpersonalInformation.zip_code = zip_code;
    newpersonalInformation.user_id = user_id;
    newpersonalInformation.social_security_number = social_security_number;
    newpersonalInformation.status = Status.IN_PROGRESS;

    const savedPersonalInformation = await personalInformationRepository.save(newpersonalInformation);
    return res.customSuccess(
      200,
      'User demographic personal information successfully created.',
      savedPersonalInformation,
    );
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
