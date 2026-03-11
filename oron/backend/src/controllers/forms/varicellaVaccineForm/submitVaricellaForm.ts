import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VaricellaFullForm } from 'orm/entities/VaricellaVaccineForm/varicellaFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitVaricellaForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const varicellaFormRepository = getRepository(VaricellaFullForm);

    const varicellaForm = await varicellaFormRepository.findOne({ where: { user_id } });

    if (!varicellaForm) {
      const customError = new CustomError(400, 'General', 'Varicella form does not exist', [
        `Varicella form does not exist`,
      ]);
      return next(customError);
    }

    await varicellaFormRepository.update(varicellaForm.id, { status: Status.AWAITING_APPROVAL });

    return res.customSuccess(200, 'Varicella form successfully submitted.', varicellaForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
