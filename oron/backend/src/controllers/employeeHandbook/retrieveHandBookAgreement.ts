import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { EmployeeHandbook } from 'orm/entities/employeeHandBook';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveHandbookAgreement = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const employeeHandbookRepository = getRepository(EmployeeHandbook);
    const user_id = req.user.id;

    const existingAgreement = await employeeHandbookRepository.findOne({ where: { user_id } });

    if (!existingAgreement) {
      return res.customSuccess(200, 'Employee has not agreed to the handbook.', null);
    }

    return res.customSuccess(200, 'Employee Handbook already agreed.', existingAgreement);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Downloading Handbook', null, err);
    return next(customError);
  }
};
