import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { EmployeeInformation } from 'orm/entities/PneumoccalVaccinationForm/employeeInformationForm';
import { PneumococcalVaccinationFullForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fillVaccinationEmployeeInformation = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  const { first_name, last_name, job_title, date_of_filling_form } = req.body;
  const employeeInformationRepository = getRepository(EmployeeInformation);
  const pneumococcalVaccinationFormRepository = getRepository(PneumococcalVaccinationFullForm);
  const user_id = req.user.id;

  try {
    const employeeInformation = await employeeInformationRepository.findOne({ where: { user_id } });
    if (employeeInformation) {
      const customError = new CustomError(
        400,
        'General',
        'Employee personal information already exists for the pneumococcal form',
        [`Employee form already exists`],
      );
      return next(customError);
    }
    const newEmployeeInformation = new EmployeeInformation();

    newEmployeeInformation.first_name = first_name;
    newEmployeeInformation.last_name = last_name;
    newEmployeeInformation.job_title = job_title;
    newEmployeeInformation.date_of_filling_form = date_of_filling_form;
    newEmployeeInformation.user_id = user_id;

    const savedEmployeeInformation = await employeeInformationRepository.save(newEmployeeInformation);

    if (savedEmployeeInformation) {
      const pneumococcalVaccinationForm = await pneumococcalVaccinationFormRepository.findOne({ where: { user_id } });
      if (pneumococcalVaccinationForm) {
        pneumococcalVaccinationForm.employee_information_id = savedEmployeeInformation.id;
        pneumococcalVaccinationForm.status = Status.IN_PROGRESS;
        await pneumococcalVaccinationFormRepository.save(pneumococcalVaccinationForm);
      } else {
        const newPneumococcalVaccinationForm = new PneumococcalVaccinationFullForm();
        newPneumococcalVaccinationForm.user_id = user_id;
        newPneumococcalVaccinationForm.employee_information_id = savedEmployeeInformation.id;
        newPneumococcalVaccinationForm.status = Status.IN_PROGRESS;
        await pneumococcalVaccinationFormRepository.save(newPneumococcalVaccinationForm);
      }
    }

    return res.customSuccess(
      200,
      'User employee information successfully created for the pneumococcal form.',
      savedEmployeeInformation,
    );
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
