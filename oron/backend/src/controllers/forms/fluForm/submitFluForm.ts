import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { FluFullForm } from 'orm/entities/FluForm/fluFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitFluForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const fluFormRepository = getRepository(FluFullForm);
    const user_id = req.user.id;
    const fluForm = await fluFormRepository.findOne({ where: { user_id } });

    if (!fluForm) {
      const customError = new CustomError(400, 'General', 'Flu form does not exist', [`Flu form does not exist`]);
      return next(customError);
    }

    await fluFormRepository.update(fluForm.id, { status: Status.AWAITING_APPROVAL });

    return res.customSuccess(200, 'Flu form successfully submitted.', fluForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
