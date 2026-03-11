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

export const editUserDocument = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { document_title, document_url } = req.body;
  const documentRepository = getRepository(UserDocument);
  const owner = req.user.id;
  const document_id = req.params.document_id;
  try {
    const document = await documentRepository.findOne({ where: { id: document_id, owner } });
    if (document) {
      document_title = document_title ?? document.document_title;
      document_url = document_url ?? document.document_url;

      const updatedDocument = new UserDocument();

      updatedDocument.document_title = document_title;
      updatedDocument.document_url = document_url;
      updatedDocument.status = Status.AWAITING_APPROVAL;

      await documentRepository.update(document.id, updatedDocument);
      return res.customSuccess(200, 'User document data successfully updated', updatedDocument);
    }
    const customError = new CustomError(400, 'General', 'User document information with this title not found', [
      `Document information does not exist`,
    ]);
    return next(customError);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
