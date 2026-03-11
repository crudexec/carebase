import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UserDocument } from 'orm/entities/Documents';
import { User } from 'orm/entities/User';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fetchUserDocuments = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const documentRepository = getRepository(UserDocument);
  const userRepository = getRepository(User);
  const user_id = req.params.user_id;
  try {
    const user = await userRepository.findOne({ where: { id: user_id, deleted_at: null } });
    if (!user) {
      const customError = new CustomError(404, 'General', `User not found`, ['User not found.']);
      return next(customError);
    }
    const userDocuments = await documentRepository.find({
      where: {
        owner: user_id,
        deleted_at: null,
      },
    });

    return res.customSuccess(200, 'User document data successfully retrieved', userDocuments);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
