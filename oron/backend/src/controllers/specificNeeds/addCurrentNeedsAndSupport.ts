import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { CurrentNeedOrSupport } from 'orm/entities/SpecificNeedsForm/CurrentNeedOrSupport';
import { SpecificNeedsFullForm } from 'orm/entities/SpecificNeedsForm/SpecificNeedsFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { Status } from 'types/genericEnums';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addCurrentNeedsAndSupport = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const specificNeedsRepository = getRepository(SpecificNeedsFullForm);
    const currentNeedsRepository = getRepository(CurrentNeedOrSupport);

    const { current_needs, specific_needs_full_form_id, intake_full_id } = req.body;

    const specificNeedsFullForm = await specificNeedsRepository.findOne(specific_needs_full_form_id);

    if (!specificNeedsFullForm) {
      const customError = new CustomError(404, 'General', 'Specific needs full form not found', null);
      return next(customError);
    }

    //current_needs is an array of the NeedDetail interface

    const currentNeeds = new CurrentNeedOrSupport();
    currentNeeds.current_needs = current_needs;
    currentNeeds.intake_full_id = intake_full_id;
    const newCurrentNeeds = await currentNeedsRepository.save(currentNeeds);

    if (!newCurrentNeeds) {
      const customError = new CustomError(400, 'Raw', 'Error adding current needs and support', null);
      return next(customError);
    }

    specificNeedsFullForm.current_need_or_support_id = newCurrentNeeds.id;

    specificNeedsFullForm.status = Status.IN_PROGRESS;

    await specificNeedsRepository.update(specificNeedsFullForm.id, specificNeedsFullForm);
    return res.customSuccess(200, 'Current needs and support added successfully.', newCurrentNeeds);
  } catch (error) {
    const customError = new CustomError(400, 'Raw', 'Error adding current needs and support', error);
    return next(customError);
  }
};
