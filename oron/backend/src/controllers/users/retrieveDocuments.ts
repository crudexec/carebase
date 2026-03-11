import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UserDocument } from 'orm/entities/Documents';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveUserDocuments = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const documentRepository = getRepository(UserDocument);
  const owner = req.user.id;
  try {
    const document = await documentRepository.find({ where: { owner, deleted_at: null } });
    if (document.length > 0) {
      return res.customSuccess(200, 'User document data successfully retrieved', document);
    }
    return res.customSuccess(200, 'No user document data found', []);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
