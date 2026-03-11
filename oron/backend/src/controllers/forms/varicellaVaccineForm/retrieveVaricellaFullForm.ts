import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VaricellaEmployeeInformation } from 'orm/entities/VaricellaVaccineForm/personalInformation';
import { VaricellaAttestationForm } from 'orm/entities/VaricellaVaccineForm/varicellaAttestation';
import { VaricellaFullForm } from 'orm/entities/VaricellaVaccineForm/varicellaFullForm';
import { VaricellaSignatureForm } from 'orm/entities/VaricellaVaccineForm/varicellaSignatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveFullVaricellaForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const user_id = req.user.id;

  const VaricellaSignatureFormRepository = getRepository(VaricellaSignatureForm);

  const VaricellaFullFormRepository = getRepository(VaricellaFullForm);

  const VaricellaAttestationFormRepository = getRepository(VaricellaAttestationForm);

  const VaricellaEmployeeInformationRepository = getRepository(VaricellaEmployeeInformation);

  try {
    const varicellaSignatureForm =
      (await VaricellaSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};
    const varicellaAttestationForm = (await VaricellaAttestationFormRepository.findOne({ where: { user_id } })) || {};
    const varicellaEmployeeInformation =
      (await VaricellaEmployeeInformationRepository.findOne({ where: { user_id } })) || {};
    const varicellaFullForm = (await VaricellaFullFormRepository.findOne({ where: { user_id } })) || {
      status: Status.NOT_STARTED,
    };

    return res.customSuccess(200, 'Full Varicella form successfully retrieved.', {
      varicellaSignatureForm,
      varicellaAttestationForm,
      varicellaEmployeeInformation,
      varicellaFullForm,
      status: varicellaFullForm.status,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
