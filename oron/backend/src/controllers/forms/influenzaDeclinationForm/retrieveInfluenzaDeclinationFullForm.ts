import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { InfluenzaVaccinationDeclinationForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/declinationInfluenzaForm';
import { InfluenzaVaccinationDeclinationFullForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm';
import { InfluenzaEmployeeInformation } from 'orm/entities/InfluenzaVaccineDeclinationForm/personalInformation';
import { InfluenzaSignatureForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/signatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveInfluenzaDeclinationFullForm = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  const user_id = req.user.id;
  const influenzaSignatureFormRepository = getRepository(InfluenzaSignatureForm);
  const influenzaVaccinationDeclinationFullFormRepository = getRepository(InfluenzaVaccinationDeclinationFullForm);
  const influenzaVaccinationDeclinationFormRepository = getRepository(InfluenzaVaccinationDeclinationForm);
  const influenzaEmployeeInformationRepository = getRepository(InfluenzaEmployeeInformation);

  try {
    const personalInformation = (await influenzaEmployeeInformationRepository.findOne({ user_id })) || {};
    const declinationForm = (await influenzaVaccinationDeclinationFormRepository.findOne({ user_id })) || {};

    const signatureForm = (await influenzaSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};

    const influenzaFullForm = (await influenzaVaccinationDeclinationFullFormRepository.findOne({
      where: { user_id },
    })) || { status: Status.NOT_STARTED };

    return res.customSuccess(200, 'Influenza form successfully retrieved.', {
      personalInformation,
      declinationForm,
      signatureForm,
      influenzaFullForm,
      status: influenzaFullForm.status,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
