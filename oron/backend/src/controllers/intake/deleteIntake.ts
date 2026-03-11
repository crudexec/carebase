import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const deleteIntake = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const intakeFullFormRepository = getRepository(IntakeFullForm);
  const account_id = req.user.account_id;
  const intake_full_id = req.params.intake_full_id;

  try {
    const intakeFullForm = await intakeFullFormRepository.findOne({
      where: { id: intake_full_id, account_id, deleted_at: null },
    });

    if (!intakeFullForm) {
      const customError = new CustomError(404, 'General', `Intake Form not found`, ['Intake Form not found.']);
      return next(customError);
    }

    await intakeFullFormRepository.softDelete(intakeFullForm.id);
    return res.customSuccess(200, 'Intake Full Form successfully deleted', null);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error deleting intake form', null, err);
    return next(customError);
  }
};
