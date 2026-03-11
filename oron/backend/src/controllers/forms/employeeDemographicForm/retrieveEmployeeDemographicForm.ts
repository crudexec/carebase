import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { EmergencyContactInformation } from 'orm/entities/EmployeeDemographicForm/emergencyDemographicForm';
import { EmployeePersonalInformation } from 'orm/entities/EmployeeDemographicForm/personalInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveEmployeeDemographicForm = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  const emergencyContactInformationRepository = getRepository(EmergencyContactInformation);
  const employeeDemographicRepository = getRepository(EmployeePersonalInformation);
  const user_id = req.user.id;

  try {
    const emergencyContactInformation = await emergencyContactInformationRepository.findOne({ where: { user_id } });
    const employeeDemographicInformation = await employeeDemographicRepository.findOne({ where: { user_id } });

    return res.customSuccess(200, 'User Employee Demographic form data found', {
      emergencyContactInformation,
      employeeDemographicInformation,
      status: employeeDemographicInformation.status,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
