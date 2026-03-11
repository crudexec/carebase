import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CJISFullForm } from 'orm/entities/CJISForm/cjisFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitCJISForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const cjisFullFormRepository = getRepository(CJISFullForm);

    const cjisForm = await cjisFullFormRepository.findOne({ where: { user_id } });

    if (!cjisForm) {
      const customError = new CustomError(400, 'General', 'CJIS Form does not exist', [`CJIS Form does not exist`]);
      return next(customError);
    }

    await cjisFullFormRepository.update(cjisForm.id, { status: Status.AWAITING_APPROVAL });

    return res.customSuccess(200, 'CJIS Form successfully submitted.', cjisForm);
  } catch (err) {}
};
