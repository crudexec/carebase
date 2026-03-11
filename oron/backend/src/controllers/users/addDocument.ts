import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UserDocument } from 'orm/entities/Documents';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const uploadUserDocument = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { document_title, document_url } = req.body;
  const documentRepository = getRepository(UserDocument);
  const owner = req.user.id;
  try {
    const document = await documentRepository.findOne({ where: { owner, document_title } });
    if (document) {
      const customError = new CustomError(400, 'General', 'User document information with this title already exists', [
        `Document information already exists`,
      ]);
      return next(customError);
    }
    const newDocument = new UserDocument();
    newDocument.document_title = document_title;
    newDocument.document_url = document_url;
    newDocument.owner = owner;
    newDocument.status = Status.AWAITING_APPROVAL;
    const documentData = await documentRepository.save(newDocument);
    return res.customSuccess(200, 'User document data successfully created for the i9 form.', documentData);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
