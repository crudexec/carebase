import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { SpecificNeedsFullForm } from '../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const deleteSpecificNeeds = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const specificNeedsRepository = getRepository(SpecificNeedsFullForm);
    const { specific_needs_full_form_id } = req.body;

    const specificNeedsForm = await specificNeedsRepository.findOne(specific_needs_full_form_id);

    if (!specificNeedsForm) {
      const customError = new CustomError(404, 'General', 'Specific needs form not found', null);
      return next(customError);
    }

    await specificNeedsRepository.softDelete(specific_needs_full_form_id);

    return res.customSuccess(200, 'Specific Needs Form successfully deleted.', null);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Creating Specific Needs Form', null, err);
    return next(customError);
  }
};
