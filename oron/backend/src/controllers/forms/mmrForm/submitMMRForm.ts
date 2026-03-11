import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MMRFullForm } from 'orm/entities/MMRVaccineForm/mmrFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitMMRForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const mmrFormRepository = getRepository(MMRFullForm);
    const mmrForm = await mmrFormRepository.findOne({ where: { user_id } });

    if (!mmrForm) {
      const customError = new CustomError(400, 'General', 'MMR form does not exist', [`MMR form does not exist`]);
      return next(customError);
    }

    await mmrFormRepository.update(mmrForm.id, { status: Status.AWAITING_APPROVAL });

    return res.customSuccess(200, 'MMR form successfully submitted.', mmrForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
