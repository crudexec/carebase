import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { N95FitAttestationForm } from 'orm/entities/N95Form/attestationForm';
import { N95FitFullForm } from 'orm/entities/N95Form/n95FullForm';
import { N95FitSignatureForm } from 'orm/entities/N95Form/signatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveN95Form = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const user_id = req.user.id;

  const n95FitSignatureFormRepository = getRepository(N95FitSignatureForm);
  const n95FitFullFormRepository = getRepository(N95FitFullForm);
  const n95FitAttestationFormRepository = getRepository(N95FitAttestationForm);

  try {
    const signatureForm = (await n95FitSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};

    const fullForm = (await n95FitFullFormRepository.findOne({ where: { user_id } })) || {
      status: Status.AWAITING_APPROVAL,
    };

    const attestationForm = (await n95FitAttestationFormRepository.findOne({ where: { user_id } })) || {};

    return res.customSuccess(200, 'N95 signature form successfully created.', {
      signatureForm,
      fullForm,
      attestationForm,
      status: fullForm.status,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
