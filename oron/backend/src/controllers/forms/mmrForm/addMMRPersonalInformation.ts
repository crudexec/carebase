import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MMRFullForm } from 'orm/entities/MMRVaccineForm/mmrFullForm';
import { MMREmployeeInformation } from 'orm/entities/MMRVaccineForm/personalInformation';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addMMRPersonalInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { first_name, last_name, job_title, date_of_filling_form } = req.body;

  const mmrEmployeeInformationRepository = getRepository(MMREmployeeInformation);
  const mmrFullFormRepository = getRepository(MMRFullForm);
  const user_id = req.user.id;

  try {
    const personalInformation = await mmrEmployeeInformationRepository.findOne({ where: { user_id } });
    if (personalInformation) {
      const customError = new CustomError(400, 'General', 'Personal information already exists', [
        `Personal information already exists`,
      ]);
      return next(customError);
    }

    const newPersonalInformation = new MMREmployeeInformation();
    newPersonalInformation.first_name = first_name;
    newPersonalInformation.last_name = last_name;
    newPersonalInformation.job_title = job_title;
    newPersonalInformation.date_of_filling_form = date_of_filling_form;
    newPersonalInformation.user_id = user_id;

    const savedPersonalInformation = await mmrEmployeeInformationRepository.save(newPersonalInformation);

    if (savedPersonalInformation) {
      const mmrFullForm = await mmrFullFormRepository.findOne({ where: { user_id } });
      if (mmrFullForm) {
        mmrFullForm.personal_information_id = savedPersonalInformation.id;
        mmrFullForm.status = Status.IN_PROGRESS;
        await mmrFullFormRepository.save(mmrFullForm);
      } else {
        const newMMRFullForm = new MMRFullForm();
        newMMRFullForm.user_id = user_id;
        newMMRFullForm.personal_information_id = savedPersonalInformation.id;
        newMMRFullForm.status = Status.IN_PROGRESS;
        await mmrFullFormRepository.save(newMMRFullForm);
      }
    }

    return res.customSuccess(200, ' Personal Information successfully created.', savedPersonalInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
