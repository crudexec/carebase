import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UserBioData } from 'orm/entities/userBioData';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveBioData = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const userBioDataRepository = getRepository(UserBioData);
  const user_id = req.user.id;
  try {
    const userBioData = await userBioDataRepository.findOne({ where: { user_id } });

    if (!userBioData) {
      const customError = new CustomError(404, 'General', `User BioData not found.`, ['User BioData not found.']);
      return next(customError);
    }

    res.customSuccess(200, 'User BioData successfully created.', userBioData);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
