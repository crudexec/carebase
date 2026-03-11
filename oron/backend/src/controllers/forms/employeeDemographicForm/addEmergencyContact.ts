import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { EmergencyContactInformation } from 'orm/entities/EmployeeDemographicForm/emergencyDemographicForm';
import { EmployeePersonalInformation } from 'orm/entities/EmployeeDemographicForm/personalInformation';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addEmergencyContactInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { first_name, last_name, relationship_to_employee, street_address, phone, city, zip_code, state } = req.body;
  const emergencyContactInformationRepository = getRepository(EmergencyContactInformation);
  const employeeDemographicRepository = getRepository(EmployeePersonalInformation);
  const user_id = req.user.id;

  try {
    const personalInformation = await emergencyContactInformationRepository.findOne({ where: { user_id } });
    if (personalInformation) {
      const customError = new CustomError(400, 'General', 'Emergency contact information already exists', [
        `Emergency contact data already exists`,
      ]);
      return next(customError);
    }
    const newpersonalInformation = new EmergencyContactInformation();
    newpersonalInformation.first_name = first_name;
    newpersonalInformation.last_name = last_name;
    newpersonalInformation.relationship_to_employee = relationship_to_employee;
    newpersonalInformation.phone = phone;
    newpersonalInformation.city = city;
    newpersonalInformation.street_address = street_address;
    newpersonalInformation.zip_code = zip_code;
    newpersonalInformation.state = state;
    newpersonalInformation.user_id = user_id;

    const savedPersonalInformation = await emergencyContactInformationRepository.save(newpersonalInformation);
    if (savedPersonalInformation) {
      const employee_personal_information = await employeeDemographicRepository.findOne({ where: { user_id } });
      if (employee_personal_information) {
        newpersonalInformation.employee_personal_information_id = employee_personal_information.id;
        await emergencyContactInformationRepository.update(savedPersonalInformation.id, newpersonalInformation);
        employee_personal_information.status = Status.IN_PROGRESS;
        await employeeDemographicRepository.update(employee_personal_information.id, employee_personal_information);
      }
    }
    return res.customSuccess(200, 'Emergency contact information successfully created.', savedPersonalInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
