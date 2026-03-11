import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UserBioData } from 'orm/entities/userBioData';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fillBioData = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
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
    npi,
    lba,
  } = req.body;
  const userBioDataRepository = getRepository(UserBioData);
  const user_id = req.user.id;

  try {
    const ssnExists = await userBioDataRepository.findOne({ where: { social_security_number } });

    const emailExists = await userBioDataRepository.findOne({ where: { email } });

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

    if (emailExists) {
      const customError = new CustomError(400, 'General', 'This Email already exists', [`Email already exists`]);
      return next(customError);
    }

    const userBioData = await userBioDataRepository.findOne({ where: { user_id } });
    if (userBioData) {
      const customError = new CustomError(400, 'General', 'User BioData already exists', [`Bio Data already exists`]);
      return next(customError);
    }
    const newUserBioData = new UserBioData();
    newUserBioData.email = email;
    newUserBioData.first_name = first_name;
    newUserBioData.last_name = last_name;
    newUserBioData.middle_name = middle_name;
    newUserBioData.other_last_name = other_last_name;
    newUserBioData.phone = phone;
    newUserBioData.address = address;
    newUserBioData.city = city;
    newUserBioData.state = state;
    newUserBioData.zip_code = zip_code;
    newUserBioData.user_id = user_id;
    newUserBioData.social_security_number = social_security_number;
    newUserBioData.apartment_number = apartment_number;
    newUserBioData.npi = npi;
    newUserBioData.lba = lba;
    newUserBioData.status = Status.AWAITING_APPROVAL;
    const savedBioData = await userBioDataRepository.save(newUserBioData);
    return res.customSuccess(200, 'User BioData successfully created.', savedBioData);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
