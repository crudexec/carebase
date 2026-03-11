import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { FatherContactInformation } from 'orm/entities/IntakeForm/fatherContactInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveFatherInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const fatherContactInformationRepository = getRepository(FatherContactInformation);
  const user_id = req.user.id;

  try {
    const fatherInformation = await fatherContactInformationRepository.findOne({ where: { user_id } });
    if (fatherInformation) {
      return res.customSuccess(200, 'Father Contact Information successfully retrieved.', fatherInformation);
    } else {
      return res.customSuccess(200, 'Father Contact Information has not been filled', null);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
