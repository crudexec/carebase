import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PneumococcalSignatureForm } from 'orm/entities/PneumoccalVaccinationForm/pneumoccalSignature';
import { PneumococcalVaccinationFullForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fillPneumococcalSignature = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { signature_data } = req.body;
  const signatureRepository = getRepository(PneumococcalSignatureForm);
  const pneumococcalVaccinationFullFormRepository = getRepository(PneumococcalVaccinationFullForm);
  const signed_by = req.user.id;

  try {
    const signature = await signatureRepository.findOne({ where: { signed_by } });
    if (signature) {
      const customError = new CustomError(
        400,
        'General',
        'User signature information already exists for the pneumococcal vaccination form',
        [`Signature information already exists`],
      );
      return next(customError);
    }
    const newSignature = new PneumococcalSignatureForm();
    newSignature.signature_data = signature_data;
    newSignature.signed_by = signed_by;

    const savedSignature = await signatureRepository.save(newSignature);

    if (savedSignature) {
      const pneumococcalVaccinationForm = await pneumococcalVaccinationFullFormRepository.findOne({
        where: { user_id: signed_by },
      });
      if (pneumococcalVaccinationForm) {
        pneumococcalVaccinationForm.pneumococcal_signature_id = savedSignature.id;
        await pneumococcalVaccinationFullFormRepository.save(pneumococcalVaccinationForm);
      } else {
        const newPneumococcalVaccinationFullForm = new PneumococcalVaccinationFullForm();
        newPneumococcalVaccinationFullForm.user_id = signed_by;
        newPneumococcalVaccinationFullForm.pneumococcal_signature_id = savedSignature.id;
        await pneumococcalVaccinationFullFormRepository.save(newPneumococcalVaccinationFullForm);
      }
    }

    return res.customSuccess(
      200,
      'User signature successfully created for the pneumococcal vaccination form.',
      savedSignature,
    );
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
