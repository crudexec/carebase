import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { I9Form } from 'orm/entities/i9Form/i9form';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitI9Form = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const i9FormRepository = getRepository(I9Form);
    const user_id = req.user.id;

    const i9Form = await i9FormRepository.findOne({ where: { owner: user_id } });

    if (!i9Form) {
      const customError = new CustomError(400, 'General', 'I9 form does not exist', [`I9 form does not exist`]);
      return next(customError);
    }

    await i9FormRepository.update(i9Form.id, { status: Status.AWAITING_APPROVAL });

    return res.customSuccess(200, 'I9 form successfully submitted.', i9Form);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
