import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const uploadProfilPictureForIntake = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const intake_full_id = req.params.intake_full_id;
    const intakeFullFormRepository = getRepository(IntakeFullForm);

    const { profile_picture } = req.body;

    const intakeFullForm = await intakeFullFormRepository.findOne({ where: { id: intake_full_id } });

    if (!intakeFullForm) {
      const customError = new CustomError(404, 'General', `Intake Form not found`, ['Intake Form not found.']);
      return next(customError);
    }

    intakeFullForm.profile_picture = profile_picture;
    await intakeFullFormRepository.update(intakeFullForm.id, intakeFullForm);

    return res.customSuccess(200, 'Intake Form successfully submitted.', intakeFullForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Uploading Intake Profile Picture', null, err);
    return next(customError);
  }
};
