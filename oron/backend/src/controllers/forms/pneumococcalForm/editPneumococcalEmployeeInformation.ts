import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { EmployeeInformation } from 'orm/entities/PneumoccalVaccinationForm/employeeInformationForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editPneumococcalEmployeeInformation = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  let { first_name, last_name, job_title } = req.body;
  const employeeInformationRepository = getRepository(EmployeeInformation);
  const user_id = req.user.id;

  try {
    const employeeInformation = await employeeInformationRepository.findOne({ where: { user_id } });
    if (employeeInformation) {
      first_name = first_name ?? employeeInformation.first_name;
      last_name = last_name ?? employeeInformation.last_name;
      job_title = job_title ?? employeeInformation.job_title;

      const newEmployeeInformation = new EmployeeInformation();
      newEmployeeInformation.first_name = first_name;
      newEmployeeInformation.last_name = last_name;
      newEmployeeInformation.job_title = job_title;

      await employeeInformationRepository.update(employeeInformation.id, newEmployeeInformation);

      return res.customSuccess(
        200,
        'User employee information successfully updated for the pneumococcal form.',
        newEmployeeInformation,
      );
    } else {
      const customError = new CustomError(
        400,
        'General',
        'Employee personal information does not exist for the pneumococcal form',
        [`Employee form does not exist`],
      );
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
