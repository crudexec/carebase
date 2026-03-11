import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { EmployeeHandbook } from 'orm/entities/employeeHandBook';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const agreeHandbook = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const employeeHandbookRepository = getRepository(EmployeeHandbook);
    const user_id = req.user.id;

    const { employee_first_name, employee_last_name, employee_email, document_url, date_of_agreement } = req.body;

    const agreedHandbook = new EmployeeHandbook();

    const existingAgreement = await employeeHandbookRepository.findOne({ where: { user_id } });

    if (existingAgreement) {
      return res.customSuccess(200, 'Employee Handbook already agreed.', existingAgreement);
    }

    agreedHandbook.employee_first_name = employee_first_name;
    agreedHandbook.employee_last_name = employee_last_name;
    agreedHandbook.employee_email = employee_email;
    agreedHandbook.document_url = document_url;
    agreedHandbook.date_of_agreement = date_of_agreement;
    agreedHandbook.user_id = user_id;

    const savedEmployeeHandbook = await employeeHandbookRepository.save(agreedHandbook);

    return res.customSuccess(200, 'Employee Handbook successfully agreed.', savedEmployeeHandbook);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Downloading Handbook', null, err);
    return next(customError);
  }
};
