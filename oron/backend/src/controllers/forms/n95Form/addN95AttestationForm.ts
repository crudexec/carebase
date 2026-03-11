import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { N95FitAttestationForm } from 'orm/entities/N95Form/attestationForm';
import { N95FitFullForm } from 'orm/entities/N95Form/n95FullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addN95AttestationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { status_received_n95_fit_testing } = req.body;

  const user_id = req.user.id;

  const n95FitAttestationFormRepository = getRepository(N95FitAttestationForm);
  const n95FitFullFormRepository = getRepository(N95FitFullForm);

  try {
    const attestationForm = await n95FitAttestationFormRepository.findOne({ where: { user_id } });

    if (attestationForm) {
      const customError = new CustomError(400, 'General', 'Attestation form already exists', [
        `Attestation form already exists`,
      ]);
      return next(customError);
    }

    const newAttestationForm = new N95FitAttestationForm();
    newAttestationForm.status_received_n95_fit_testing = status_received_n95_fit_testing;
    newAttestationForm.user_id = user_id;

    const savedAttestationForm = await n95FitAttestationFormRepository.save(newAttestationForm);

    if (savedAttestationForm) {
      const fullForm = await n95FitFullFormRepository.findOne({ where: { user_id } });
      if (fullForm) {
        fullForm.attestation_id = savedAttestationForm.id;
        fullForm.status = Status.IN_PROGRESS;
        await n95FitFullFormRepository.save(fullForm);
      } else {
        const newFullForm = new N95FitFullForm();
        newFullForm.user_id = user_id;
        newFullForm.attestation_id = savedAttestationForm.id;
        newFullForm.status = Status.IN_PROGRESS;
        await n95FitFullFormRepository.save(newFullForm);
      }
    }
    return res.customSuccess(200, 'N95 form attestation successfully created.', savedAttestationForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
