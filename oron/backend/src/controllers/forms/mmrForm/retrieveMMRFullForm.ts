import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MMRAttestationForm } from 'orm/entities/MMRVaccineForm/mmrAttestationForm';
import { MMRFullForm } from 'orm/entities/MMRVaccineForm/mmrFullForm';
import { MMRSignatureForm } from 'orm/entities/MMRVaccineForm/mmrSignatureForm';
import { MMREmployeeInformation } from 'orm/entities/MMRVaccineForm/personalInformation';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveMMRFullForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const mmrSignatureFormRepository = getRepository(MMRSignatureForm);
  const mmrFullFormRepository = getRepository(MMRFullForm);
  const mmrEmployeeInformationRepository = getRepository(MMREmployeeInformation);
  const mmrAttestationFormRepository = getRepository(MMRAttestationForm);
  const user_id = req.user.id;

  try {
    const mmrFullForm = (await mmrFullFormRepository.findOne({ where: { user_id } })) || { status: Status.NOT_STARTED };
    const mmrEmployeeInformation = (await mmrEmployeeInformationRepository.findOne({ where: { user_id } })) || {};
    const mmrAttestationForm = (await mmrAttestationFormRepository.findOne({ where: { user_id } })) || {};
    const mmrSignatureForm = (await mmrSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};

    return res.customSuccess(200, 'Form successfully retrieved.', {
      mmrFullForm,
      mmrEmployeeInformation,
      mmrAttestationForm,
      mmrSignatureForm,
      status: mmrFullForm.status,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
