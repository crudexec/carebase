import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { CurrentNeedOrSupport } from '../../orm/entities/SpecificNeedsForm/CurrentNeedOrSupport';
import { SpecificNeedsFullForm } from '../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { Status } from 'types/genericEnums';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editCurrentNeedsAndSupport = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const specificNeedsRepository = getRepository(SpecificNeedsFullForm);
    const currentNeedsRepository = getRepository(CurrentNeedOrSupport);

    let { current_needs, specific_needs_full_form_id, current_need_or_support_id } = req.body;

    const specificNeedsFullForm = await specificNeedsRepository.findOne(specific_needs_full_form_id);

    if (!specificNeedsFullForm) {
      const customError = new CustomError(404, 'General', 'Specific needs full form not found', null);
      return next(customError);
    }

    // Find existing current needs
    const existingCurrentNeeds = await currentNeedsRepository.findOne(current_need_or_support_id);

    if (!existingCurrentNeeds) {
      const customError = new CustomError(404, 'General', 'Current needs and support not found', null);
      return next(customError);
    }

    // Update the current needs
    existingCurrentNeeds.current_needs = current_needs;

    const updatedCurrentNeeds = await currentNeedsRepository.update(existingCurrentNeeds.id, existingCurrentNeeds);

    if (!updatedCurrentNeeds) {
      const customError = new CustomError(400, 'Raw', 'Error updating current needs and support', null);
      return next(customError);
    }
    return res.customSuccess(200, 'Current needs and support updated successfully.', updatedCurrentNeeds);
  } catch (error) {
    const customError = new CustomError(400, 'Raw', 'Error updating current needs and support', error);
    return next(customError);
  }
};
