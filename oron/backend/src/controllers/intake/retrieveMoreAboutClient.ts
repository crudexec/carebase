import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MoreAboutInformation } from 'orm/entities/IntakeForm/moreAboutClient';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveMoreAboutClient = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const moreAboutInformationRepository = getRepository(MoreAboutInformation);
    const user_id = req.user.id;

    const moreAboutInformation = await moreAboutInformationRepository.findOne({ where: { user_id } });
    if (!moreAboutInformation) {
      return res.customSuccess(200, 'More About Client Information has not been filled', null);
    }

    return res.customSuccess(200, 'More About Client Information successfully retrieved.', moreAboutInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Retrieving More About Client', null, err);
    return next(customError);
  }
};
