import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Documents } from 'orm/entities/i9Form/document';
import { I9Form } from 'orm/entities/i9Form/i9form';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fillDocument = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const documentData = req.body.documentData;
  const documentRepository = getRepository(Documents);
  const documentDump = [];
  const owner = req.user.id;
  try {
    for (let i = 0; i < documentData.length; i++) {
      const { title, issuing_authority, document_number, file_url, expiration_date } = documentData[i];
      const document = await documentRepository.findOne({ where: { owner, title } });
      if (document) {
        const customError = new CustomError(
          400,
          'General',
          'User document information with this title already exists for the i9 form',
          [`Document information already exists`],
        );
        return next(customError);
      }
      const newDocument = new Documents();
      newDocument.title = title;
      newDocument.issuing_authority = issuing_authority;
      newDocument.document_number = document_number;
      newDocument.file_url = file_url;
      newDocument.expiration_date = expiration_date;
      newDocument.owner = owner;
      await documentRepository.save(newDocument);
      documentDump.push(newDocument);
    }
    if (documentDump.length > 0) {
      const i9FormRepository = getRepository(I9Form);
      const i9Form = await i9FormRepository.findOne({ where: { owner } });
      if (i9Form) {
        i9Form.document_id = documentDump[0].id;
        i9Form.status = Status.IN_PROGRESS;
        await i9FormRepository.save(i9Form);
      } else {
        const newI9Form = new I9Form();
        newI9Form.owner = owner;
        newI9Form.document_id = documentDump[0].id;
        newI9Form.status = Status.IN_PROGRESS;
        await i9FormRepository.save(newI9Form);
      }
    }
    return res.customSuccess(200, 'User document data successfully created for the i9 form.', documentDump);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
