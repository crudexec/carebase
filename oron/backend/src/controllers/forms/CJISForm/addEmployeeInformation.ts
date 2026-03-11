import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CJISEmployeeInformation } from 'orm/entities/CJISForm/cjisEmployeeInformation';
import { CJISFullForm } from 'orm/entities/CJISForm/cjisFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addEmployeeInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { first_name, last_name, date_of_hire, employee_id, job_title } = req.body;

  try {
    const cjisEmployeeInformationRepository = getRepository(CJISEmployeeInformation);
    const cjisFullFormRepository = getRepository(CJISFullForm);

    const user_id = req.user.id;

    const cjisForm = await cjisFullFormRepository.findOne({ where: { user_id } });

    if (cjisForm) {
      const customError = new CustomError(400, 'General', 'CJIS Form already exists', [`CJIS Form already exists`]);
      return next(customError);
    }

    const newCJISEmployeeInformation = new CJISEmployeeInformation();
    newCJISEmployeeInformation.first_name = first_name;
    newCJISEmployeeInformation.last_name = last_name;
    newCJISEmployeeInformation.date_of_hire = date_of_hire;
    newCJISEmployeeInformation.employee_id = employee_id;
    newCJISEmployeeInformation.job_title = job_title;
    newCJISEmployeeInformation.user_id = user_id;

    const savedCJISEmployeeInformation = await cjisEmployeeInformationRepository.save(newCJISEmployeeInformation);

    if (savedCJISEmployeeInformation) {
      const newCJISForm = new CJISFullForm();
      const alreadyExists = await cjisFullFormRepository.findOne({ where: { user_id } });
      if (alreadyExists) {
        newCJISForm.employee_information_id = savedCJISEmployeeInformation.id;
        newCJISForm.status = Status.IN_PROGRESS;
        await cjisFullFormRepository.update(cjisForm.id, newCJISForm);
      }
      newCJISForm.user_id = user_id;
      newCJISForm.employee_information_id = savedCJISEmployeeInformation.id;
      newCJISForm.status = Status.IN_PROGRESS;
      await cjisFullFormRepository.save(newCJISForm);
    }

    return res.customSuccess(200, 'CJIS Employee Information successfully created.', savedCJISEmployeeInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
