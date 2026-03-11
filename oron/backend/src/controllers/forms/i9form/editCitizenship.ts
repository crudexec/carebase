import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CitizenshipForm } from 'orm/entities/i9Form/citizenship';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editCitizenshipInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let {
    citizenship_status,
    uscis_number,
    work_license_expiry_date,
    i_94_number,
    foreign_passport_number,
    foreign_passport_issuing_country,
  } = req.body;
  const citizenshipRepository = getRepository(CitizenshipForm);
  const owner = req.user.id;

  try {
    const citizenship = await citizenshipRepository.findOne({ where: { owner } });
    if (citizenship) {
      citizenship_status = citizenship_status ?? citizenship.citizenship_status;
      uscis_number = uscis_number ?? citizenship.uscis_number;
      work_license_expiry_date = work_license_expiry_date ?? citizenship.work_license_expiry_date;
      i_94_number = i_94_number ?? citizenship.i_94_number;
      foreign_passport_number = foreign_passport_number ?? citizenship.foreign_passport_number;
      foreign_passport_issuing_country =
        foreign_passport_issuing_country ?? citizenship.foreign_passport_issuing_country;

      const newCitizenship = new CitizenshipForm();

      newCitizenship.citizenship_status = citizenship_status;
      newCitizenship.uscis_number = uscis_number;
      newCitizenship.work_license_expiry_date = work_license_expiry_date;
      newCitizenship.i_94_number = i_94_number;
      newCitizenship.foreign_passport_number = foreign_passport_number;
      newCitizenship.foreign_passport_issuing_country = foreign_passport_issuing_country;

      await citizenshipRepository.update(citizenship.id, newCitizenship);

      return res.customSuccess(200, 'User citizenship data successfully created for the i9 form.', newCitizenship);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
