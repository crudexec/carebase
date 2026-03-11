import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PneumococcalVaccinationFullForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitPneumococcalForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const pneumococcalFormRepository = getRepository(PneumococcalVaccinationFullForm);
    const pneumococcalForm = await pneumococcalFormRepository.findOne({ where: { user_id } });

    if (!pneumococcalForm) {
      const customError = new CustomError(400, 'General', 'Pneumococcal form does not exist', [
        `Pneumococcal form does not exist`,
      ]);
      return next(customError);
    }

    await pneumococcalFormRepository.update(pneumococcalForm.id, { status: Status.AWAITING_APPROVAL });

    return res.customSuccess(200, 'Pneumococcal form successfully submitted.', pneumococcalForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
