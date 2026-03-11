import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { N95FitAttestationForm } from 'orm/entities/N95Form/attestationForm';
import { N95FitSignatureForm } from 'orm/entities/N95Form/signatureForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editN95AttestationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { status_received_n95_fit_testing } = req.body;

  const user_id = req.user.id;

  const n95FitAttestationFormRepository = getRepository(N95FitAttestationForm);

  try {
    const attestationForm = await n95FitAttestationFormRepository.findOne({ where: { user_id } });

    if (attestationForm) {
      status_received_n95_fit_testing =
        status_received_n95_fit_testing ?? attestationForm.status_received_n95_fit_testing;

      const newAttestationForm = new N95FitAttestationForm();
      newAttestationForm.status_received_n95_fit_testing = status_received_n95_fit_testing;

      await n95FitAttestationFormRepository.update(attestationForm.id, newAttestationForm);

      return res.customSuccess(200, 'N95 attestation form successfully updated.', newAttestationForm);
    } else {
      const customError = new CustomError(400, 'General', 'N95 attestation form does not exist', [
        `N95 attestation form does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
