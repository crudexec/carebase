import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Documents } from 'orm/entities/i9Form/document';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editDocument = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const documentData = req.body.documentData;
  const documentRepository = getRepository(Documents);
  const documentDump = [];
  const owner = req.user.id;
  try {
    for (let i = 0; i < documentData.length; i++) {
      let { title, issuing_authority, document_number, file_url, expiration_date } = documentData[i];
      const document = await documentRepository.findOne({ where: { owner, title } });
      if (document) {
        title = title ?? document.title;
        issuing_authority = issuing_authority ?? document.issuing_authority;
        document_number = document_number ?? document.document_number;
        file_url = file_url ?? document.file_url;
        expiration_date = expiration_date ?? document.expiration_date;

        const newDocument = new Documents();

        newDocument.title = title;
        newDocument.issuing_authority = issuing_authority;
        newDocument.document_number = document_number;
        newDocument.file_url = file_url;
        newDocument.expiration_date = expiration_date;

        await documentRepository.update(document.id, newDocument);
        documentDump.push(newDocument);
      } else {
        const customError = new CustomError(
          400,
          'General',
          'User document information with this title does not exists for the i9 form',
          [`Document information does not exists`],
        );
        return next(customError);
      }
    }
    return res.customSuccess(200, 'User document data successfully created for the i9 form.', documentDump);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
