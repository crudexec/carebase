import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VaricellaEmployeeInformation } from 'orm/entities/VaricellaVaccineForm/personalInformation';
import { VaricellaFullForm } from 'orm/entities/VaricellaVaccineForm/varicellaFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addVaricellaPersonalInformationForm = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  const { first_name, last_name, job_title, date_of_filling_form } = req.body;
  const user_id = req.user.id;
  const VaricellaEmployeeInformationRepository = getRepository(VaricellaEmployeeInformation);
  const VaricellaFullFormRepository = getRepository(VaricellaFullForm);

  try {
    const newVaricellaEmployeeInformation = new VaricellaEmployeeInformation();

    const varicellaEmployeeInformation = await VaricellaEmployeeInformationRepository.findOne({ where: { user_id } });

    if (varicellaEmployeeInformation) {
      const customError = new CustomError(400, 'General', 'Personal information already exists', [
        `Personal information already exists`,
      ]);
      return next(customError);
    }

    newVaricellaEmployeeInformation.first_name = first_name;
    newVaricellaEmployeeInformation.last_name = last_name;
    newVaricellaEmployeeInformation.job_title = job_title;
    newVaricellaEmployeeInformation.date_of_filling_form = date_of_filling_form;
    newVaricellaEmployeeInformation.user_id = user_id;

    const savedVaricellaEmployeeInformation = await VaricellaEmployeeInformationRepository.save(
      newVaricellaEmployeeInformation,
    );

    if (savedVaricellaEmployeeInformation) {
      const varicellaFullForm = await VaricellaFullFormRepository.findOne({ where: { user_id } });
      if (varicellaFullForm) {
        varicellaFullForm.personal_information_id = savedVaricellaEmployeeInformation.id;
        varicellaFullForm.status = Status.IN_PROGRESS;
        await VaricellaFullFormRepository.save(varicellaFullForm);
      } else {
        const newVaricellaFullForm = new VaricellaFullForm();
        newVaricellaFullForm.user_id = user_id;
        newVaricellaFullForm.personal_information_id = savedVaricellaEmployeeInformation.id;
        newVaricellaFullForm.status = Status.IN_PROGRESS;
        await VaricellaFullFormRepository.save(newVaricellaFullForm);
      }
    }
    return res.customSuccess(200, ' Personal Information successfully created.', savedVaricellaEmployeeInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
