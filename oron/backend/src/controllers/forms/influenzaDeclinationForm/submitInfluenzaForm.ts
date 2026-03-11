import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { InfluenzaVaccinationDeclinationFullForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitInfluenzaForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const influenzaFormRepository = getRepository(InfluenzaVaccinationDeclinationFullForm);
    const influenzaForm = await influenzaFormRepository.findOne({ where: { user_id } });

    if (!influenzaForm) {
      const customError = new CustomError(400, 'General', 'Influenza form does not exist', [
        `Influenza form does not exist`,
      ]);
      return next(customError);
    }

    await influenzaFormRepository.update(influenzaForm.id, { status: Status.AWAITING_APPROVAL });

    return res.customSuccess(200, 'Influenza form successfully submitted.', influenzaForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
