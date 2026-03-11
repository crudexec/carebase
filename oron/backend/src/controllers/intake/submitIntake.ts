import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { IntakeFormStatus } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitIntakeForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const intakeFullFormRepository = getRepository(IntakeFullForm);
    const { intake_full_id } = req.body;

    const intakeFullForm = await intakeFullFormRepository.findOne({ where: { id: intake_full_id } });

    if (!intakeFullForm) {
      const customError = new CustomError(404, 'General', `Intake Form not found`, ['Intake Form not found.']);
      return next(customError);
    }

    intakeFullForm.status = IntakeFormStatus.New_Intake;

    await intakeFullFormRepository.update(intakeFullForm.id, intakeFullForm);

    return res.customSuccess(200, 'Intake Form successfully submitted.', intakeFullForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error', null, err);
    return next(customError);
  }
};
