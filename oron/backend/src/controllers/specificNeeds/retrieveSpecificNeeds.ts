import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { SpecificNeedsFullForm } from '../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { Status } from 'types/genericEnums';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveGenericSpecificNeeds = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const specificNeedsRepository = getRepository(SpecificNeedsFullForm);
    const intake_full_id = req.query.intake_full_id;

    const specificNeedsForm = await specificNeedsRepository.findOne({
      where: { intake_full_id, deleted_at: null },
      relations: ['basicInformation', 'serviceNeeds', 'currentNeedOrSupport', 'authorization', 'intakeFullForm'],
    });

    if (!specificNeedsForm) {
      const customError = new CustomError(404, 'General', 'Specific needs form not found', null);
      return next(customError);
    }

    return res.customSuccess(200, 'Specific Needs Form successfully retrieved.', specificNeedsForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Creating Specific Needs Form', null, err);
    return next(customError);
  }
};
