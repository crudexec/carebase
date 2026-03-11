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

export const editPersonalInformationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let {
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
    const personalInformation = await personalInformationRepository.findOne({ where: { user_id } });
    if (personalInformation) {
      const newpersonalInformation = new EmployeePersonalInformation();

      first_name = first_name ?? personalInformation.first_name;
      last_name = last_name ?? personalInformation.last_name;
      date_of_birth = date_of_birth ?? personalInformation.date_of_birth;
      home_phone_number = home_phone_number ?? personalInformation.home_phone_number;
      phone = phone ?? personalInformation.phone;
      city = city ?? personalInformation.city;
      race_or_ethinicity = race_or_ethinicity ?? personalInformation.race_or_ethinicity;
      gender = gender ?? personalInformation.gender;
      state = state ?? personalInformation.state;
      street_address = street_address ?? personalInformation.street_address;
      zip_code = zip_code ?? personalInformation.zip_code;
      social_security_number = social_security_number ?? personalInformation.social_security_number;

      if (social_security_number !== personalInformation.social_security_number) {
        const ssnExists = await personalInformationRepository.findOne({ where: { social_security_number } });
        if (ssnExists) {
          const customError = new CustomError(400, 'General', 'This Social Security Number already exists', [
            `SSN already exists`,
          ]);
          return next(customError);
        }
      }

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
      newpersonalInformation.social_security_number = social_security_number;
      newpersonalInformation.status = Status.AWAITING_APPROVAL;

      await personalInformationRepository.update(personalInformation.id, newpersonalInformation);

      return res.customSuccess(
        200,
        'User demographic personal information successfully updated.',
        newpersonalInformation,
      );
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
