import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { I9Form } from 'orm/entities/i9Form/i9form';
import { Signature } from 'orm/entities/i9Form/signature';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fillSignature = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { signature_data } = req.body;
  const signatureRepository = getRepository(Signature);
  const i9FormRepository = getRepository(I9Form);
  const signed_by = req.user.id;

  try {
    const signature = await signatureRepository.findOne({ where: { signed_by } });
    if (signature) {
      const customError = new CustomError(400, 'General', 'User signature information already exists for the i9 form', [
        `Signature information already exists`,
      ]);
      return next(customError);
    }
    const newSignature = new Signature();
    newSignature.signature_data = signature_data;
    newSignature.signed_by = signed_by;

    const savedSignature = await signatureRepository.save(newSignature);
    if (savedSignature) {
      const i9Form = await i9FormRepository.findOne({ where: { owner: signed_by } });
      if (i9Form) {
        i9Form.signature_id = savedSignature.id;
        i9Form.status = Status.IN_PROGRESS;
        await i9FormRepository.save(i9Form);
      } else {
        const newI9Form = new I9Form();
        newI9Form.owner = signed_by;
        newI9Form.signature_id = savedSignature.id;
        newI9Form.status = Status.IN_PROGRESS;
        await i9FormRepository.save(newI9Form);
      }
    }

    return res.customSuccess(200, 'User signature successfully created for the i9 form.', savedSignature);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
