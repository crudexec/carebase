import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { Authorization } from '../../orm/entities/SpecificNeedsForm/Authorization';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editAuthorization = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const authorizationRepository = getRepository(Authorization);
    let { creator_name, signature_confirmation, authorization_id, signature_url } = req.body;

    // Check if authorization exists
    const authorization = await authorizationRepository.findOne(authorization_id);

    if (!authorization) {
      const customError = new CustomError(404, 'General', 'Authorization not found', null);
      return next(customError);
    }

    creator_name = creator_name ?? authorization.creator_name;
    signature_confirmation = signature_confirmation ?? authorization.signature_confirmation;
    signature_url = signature_url ?? authorization.signature_url;

    // Update authorization fields
    authorization.creator_name = creator_name;
    authorization.signature_confirmation = signature_confirmation;
    authorization.signature_url = signature_url;

    const updatedAuthorization = await authorizationRepository.update(authorization_id, authorization);

    if (!updatedAuthorization) {
      const customError = new CustomError(400, 'Raw', 'Error updating authorization', null);
      return next(customError);
    }

    return res.customSuccess(200, 'Authorization updated successfully.', authorization);
  } catch (error) {
    const customError = new CustomError(400, 'Raw', 'Error updating authorization', error);
    return next(customError);
  }
};
