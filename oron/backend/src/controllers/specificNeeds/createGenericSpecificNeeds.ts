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

export const createGenericSpecificNeeds = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const specificNeedsRepository = getRepository(SpecificNeedsFullForm);
    const registered_by = req.user.id;
    const intake_full_id = req.body.intake_full_id;
    const specificNeeds = new SpecificNeedsFullForm();

    specificNeeds.intake_full_id = intake_full_id;
    specificNeeds.status = Status.DRAFT;
    specificNeeds.registered_by = registered_by;
    const savedSpecificNeeds = await specificNeedsRepository.save(specificNeeds);

    return res.customSuccess(200, 'Specific Needs Form successfully created.', savedSpecificNeeds);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Creating Specific Needs Form', null, err);
    return next(customError);
  }
};
