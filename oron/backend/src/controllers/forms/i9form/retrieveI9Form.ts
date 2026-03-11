import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { I9Form } from 'orm/entities/i9Form/i9form';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveFilledI9Document = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const i9FormRepository = getRepository(I9Form);
    const i9Form = await i9FormRepository.findOne({ where: { owner: user_id } });

    if (!i9Form) {
      const customError = new CustomError(400, 'General', 'I9 form does not exist', [`I9 form does not exist`]);
      return next(customError);
    }

    return res.customSuccess(200, 'I9 form successfully retrieved.', i9Form);
  } catch (err) {}
};
