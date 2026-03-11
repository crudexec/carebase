import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TuberculosisFullForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const submitTuberculosisForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const tuberculosisFormRepository = getRepository(TuberculosisFullForm);

    const tuberculosisForm = await tuberculosisFormRepository.findOne({ where: { owner: user_id } });

    if (!tuberculosisForm) {
      const customError = new CustomError(400, 'General', 'Tuberculosis form does not exist', [
        `Tuberculosis form does not exist`,
      ]);
      return next(customError);
    }

    await tuberculosisFormRepository.update(tuberculosisForm.id, { status: Status.AWAITING_APPROVAL });

    return res.customSuccess(200, 'Tuberculosis form successfully submitted.', tuberculosisForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
