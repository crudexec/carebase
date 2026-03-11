import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { HepatitisBFullForm } from 'orm/entities/HepatitisBForm/HepatitisFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitHepatitisForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const hepatitisFullFormRepository = getRepository(HepatitisBFullForm);
    const user_id = req.user.id;

    const hepatitisForm = await hepatitisFullFormRepository.findOne({ where: { user_id } });
    if (!hepatitisForm) {
      const customError = new CustomError(400, 'General', 'Hepatitis form does not exist', [
        `Hepatitis form does not exist`,
      ]);
      return next(customError);
    }

    await hepatitisFullFormRepository.update(hepatitisForm.id, { status: Status.AWAITING_APPROVAL });

    return res.customSuccess(200, 'Hepatitis form successfully submitted.', hepatitisForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
