import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MMREmployeeInformation } from 'orm/entities/MMRVaccineForm/personalInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editMMRPersonalInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { first_name, last_name, job_title, date_of_filling_form } = req.body;
  const mmrEmployeeInformationRepository = getRepository(MMREmployeeInformation);
  const user_id = req.user.id;

  try {
    const personalInformation = await mmrEmployeeInformationRepository.findOne({ where: { user_id } });
    if (personalInformation) {
      first_name = first_name ?? personalInformation.first_name;
      last_name = last_name ?? personalInformation.last_name;
      job_title = job_title ?? personalInformation.job_title;
      date_of_filling_form = date_of_filling_form ?? personalInformation.date_of_filling_form;

      const newPersonalInformation = new MMREmployeeInformation();
      newPersonalInformation.first_name = first_name;
      newPersonalInformation.last_name = last_name;
      newPersonalInformation.job_title = job_title;
      newPersonalInformation.date_of_filling_form = date_of_filling_form;

      await mmrEmployeeInformationRepository.update(personalInformation.id, newPersonalInformation);

      return res.customSuccess(200, ' Personal Information successfully updated.', newPersonalInformation);
    } else {
      const customError = new CustomError(400, 'General', 'Personal information does not exist', [
        `Personal information does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
