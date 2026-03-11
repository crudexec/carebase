import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { EmployeePersonalInformation } from 'orm/entities/EmployeeDemographicForm/personalInformation';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitEmployeeDemographicForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const demographicRepository = getRepository(EmployeePersonalInformation);
    const user_id = req.user.id;
    const demographicForm = await demographicRepository.findOne({ where: { user_id } });

    if (!demographicForm) {
      const customError = new CustomError(400, 'General', 'Employee demographic form does not exist', [
        `Employee demographic form does not exist`,
      ]);
      return next(customError);
    }

    await demographicRepository.update(demographicForm.id, { status: Status.AWAITING_APPROVAL });

    return res.customSuccess(200, 'Employee demographic form successfully submitted.', demographicForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
