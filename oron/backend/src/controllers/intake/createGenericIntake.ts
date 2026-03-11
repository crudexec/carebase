import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const createGenericIntake = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const intakeRepository = getRepository(IntakeFullForm);
    const { first_name, last_name } = req.body;
    const registered_by = req.user.id;
    const account_id = req.user.account_id;
    const intake = new IntakeFullForm();

    intake.first_name = first_name;
    intake.last_name = last_name;
    intake.registered_by = registered_by;
    intake.account_id = account_id;

    const savedIntake = await intakeRepository.save(intake);

    return res.customSuccess(200, 'Intake Form successfully created.', savedIntake);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Creating Intake Form', null, err);
    return next(customError);
  }
};
