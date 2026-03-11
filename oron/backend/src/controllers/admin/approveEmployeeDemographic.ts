import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { EmployeePersonalInformation } from 'orm/entities/EmployeeDemographicForm/personalInformation';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { sendApproveMail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ApproveDemographicForm = async (req: Request, res: Response, next: NextFunction) => {
  const employeePersonalInformationRepository = getRepository(EmployeePersonalInformation);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  try {
    const employeeForm = await employeePersonalInformationRepository.findOne({ where: { id: form_id } });

    if (!employeeForm) {
      const customError = new CustomError(404, 'General', `Employee  Form not found.`, [
        'Employee demographic Form not found.',
      ]);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: employeeForm.user_id } });

    if (!user) {
      const customError = new CustomError(404, 'General', `User not found.`, ['User not found.']);
      return next(customError);
    }

    await employeePersonalInformationRepository.update({ id: form_id }, { status: Status.APPROVED });

    await sendApproveMail(employeeForm.first_name, `Employee Demographic Form`, String(user.email));

    return res.customSuccess(200, 'Employee Demographic Form successfully approved.', employeeForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
