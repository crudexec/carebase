import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UserBioData } from 'orm/entities/userBioData';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editBioData = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let {
    first_name,
    last_name,
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
    const userBioData = await userBioDataRepository.findOne({ where: { user_id } });

    if (!userBioData) {
      const customError = new CustomError(404, 'General', `User BioData not found.`, ['User BioData not found.']);
      return next(customError);
    }
    first_name = first_name || userBioData.first_name;
    last_name = last_name || userBioData.last_name;
    middle_name = middle_name || userBioData.middle_name;
    other_last_name = other_last_name || userBioData.other_last_name;
    phone = phone || userBioData.phone;
    address = address || userBioData.address;
    city = city || userBioData.city;
    state = state || userBioData.state;
    zip_code = zip_code || userBioData.zip_code;
    social_security_number = social_security_number || userBioData.social_security_number;
    apartment_number = apartment_number || userBioData.apartment_number;
    npi = npi || userBioData.npi;
    lba = lba || userBioData.lba;

    if (social_security_number !== userBioData.social_security_number) {
      const ssnExists = await userBioDataRepository.findOne({ where: { social_security_number } });
      if (ssnExists) {
        const customError = new CustomError(400, 'General', 'This Social Security Number already exists', [
          `SSN already exists`,
        ]);
        return next(customError);
      }
    }

    userBioData.first_name = first_name;
    userBioData.last_name = last_name;
    userBioData.middle_name = middle_name;
    userBioData.other_last_name = other_last_name;
    userBioData.phone = phone;
    userBioData.address = address;
    userBioData.city = city;
    userBioData.state = state;
    userBioData.zip_code = zip_code;
    userBioData.social_security_number = social_security_number;
    userBioData.apartment_number = apartment_number;
    userBioData.npi = npi;
    userBioData.lba = lba;

    const updatedBiodata = await userBioDataRepository.save(userBioData);

    res.customSuccess(200, 'User BioData successfully created.', updatedBiodata);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
