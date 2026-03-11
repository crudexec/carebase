import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Signature } from 'orm/entities/i9Form/signature';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editSignature = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { signature_data } = req.body;
  const signatureRepository = getRepository(Signature);
  const signed_by = req.user.id;

  try {
    const signature = await signatureRepository.findOne({ where: { signed_by } });
    if (signature) {
      signature_data = signature_data ?? signature.signature_data;
      const newSignature = new Signature();

      newSignature.signature_data = signature_data;
      newSignature.signed_by = signed_by;

      await signatureRepository.update(signature.id, newSignature);

      return res.customSuccess(200, 'User signature data successfully updated for the i9 form.', newSignature);
    } else {
      const customError = new CustomError(
        400,
        'General',
        'User signature information does not exists for the i9 form',
        [`Signature information does not exists`],
      );
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
