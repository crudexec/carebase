import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { EmployeePersonalInformation } from 'orm/entities/EmployeeDemographicForm/personalInformation';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { SendReviewEmail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ReviewDemographicForm = async (req: Request, res: Response, next: NextFunction) => {
  const employeePersonalInformationRepository = getRepository(EmployeePersonalInformation);
  const userRepository = getRepository(User);
  const form_id = req.params.id;
  const { review_notes } = req.body;
  try {
    const employeeForm = await employeePersonalInformationRepository.findOne({ where: { id: form_id } });

    if (!employeeForm) {
      const customError = new CustomError(404, 'General', `Employee  Form not found.`, [
        'Employee demographic Form not found.',
      ]);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: employeeForm.user_id } });
    await employeePersonalInformationRepository.update({ id: form_id }, { status: Status.REVIEWED, review_notes });

    await SendReviewEmail(employeeForm.first_name, `Employee Demographic Form`, review_notes, String(user.email));

    return res.customSuccess(200, 'Employee Demographic Form successfully reviewed.', employeeForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
