import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { Authorization } from '../../orm/entities/SpecificNeedsForm/Authorization';
import { SpecificNeedsFullForm } from '../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm';
import { IntakeFullForm } from '../../orm/entities/IntakeForm/intakeFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addAuthorization = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const authorizationRepository = getRepository(Authorization);
    const intakeRepository = getRepository(IntakeFullForm);
    const specificNeedsRepository = getRepository(SpecificNeedsFullForm);

    const { creator_name, signature_confirmation, intake_full_id, specific_needs_full_form_id, signature_url } =
      req.body;

    // Check if intake form exists
    const intakeForm = await intakeRepository.findOne({ where: { id: intake_full_id, deleted_at: null } });

    if (!intakeForm) {
      const customError = new CustomError(404, 'General', 'Intake form not found', null);
      return next(customError);
    }

    const authorization = new Authorization();
    authorization.creator_name = creator_name;
    authorization.signature_confirmation = signature_confirmation;
    authorization.intake_full_id = intake_full_id;
    authorization.signature_url = signature_url;

    const newAuthorization = await authorizationRepository.save(authorization);

    if (!newAuthorization) {
      const customError = new CustomError(400, 'Raw', 'Error adding authorization', null);
      return next(customError);
    }

    const specificNeedsForm = await specificNeedsRepository.findOne({
      where: {
        id: specific_needs_full_form_id,
        deleted_at: null,
      },
    });

    if (!specificNeedsForm) {
      const customError = new CustomError(404, 'General', 'Specific needs form not found', null);
      return next(customError);
    }

    specificNeedsForm.authorization_id = newAuthorization.id;
    await specificNeedsRepository.update(specificNeedsForm.id, specificNeedsForm);

    return res.customSuccess(200, 'Authorization added successfully.', newAuthorization);
  } catch (error) {
    const customError = new CustomError(400, 'Raw', 'Error adding authorization', error);
    return next(customError);
  }
};
