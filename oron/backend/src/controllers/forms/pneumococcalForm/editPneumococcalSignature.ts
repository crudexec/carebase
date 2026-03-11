import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PneumococcalSignatureForm } from 'orm/entities/PneumoccalVaccinationForm/pneumoccalSignature';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editPneumococcalSignature = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { signature_data } = req.body;
  const signatureRepository = getRepository(PneumococcalSignatureForm);
  const signed_by = req.user.id;

  try {
    const signature = await signatureRepository.findOne({ where: { signed_by } });
    if (signature) {
      signature_data = signature_data ?? signature.signature_data;
      const newSignature = new PneumococcalSignatureForm();
      newSignature.signature_data = signature_data;
      newSignature.updated_at = new Date();

      await signatureRepository.update(signature.id, newSignature);

      return res.customSuccess(
        200,
        'User signature successfully updated for the pneumococcal vaccination form.',
        newSignature,
      );
    } else {
      const customError = new CustomError(
        400,
        'General',
        'User signature information does not exist for the pneumococcal vaccination form',
        [`Signature information does not exist`],
      );
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
