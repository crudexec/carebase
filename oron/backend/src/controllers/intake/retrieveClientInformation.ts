import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ClientInformation } from 'orm/entities/IntakeForm/clientInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveClientInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const clientInformationRepository = getRepository(ClientInformation);
  const user_id = req.user.id;

  try {
    const clientInformation = await clientInformationRepository.findOne({ where: { user_id } });
    if (clientInformation) {
      return res.customSuccess(200, 'Client Information successfully retrieved.', clientInformation);
    } else {
      return res.customSuccess(200, 'Client Information has not been filled', null);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
