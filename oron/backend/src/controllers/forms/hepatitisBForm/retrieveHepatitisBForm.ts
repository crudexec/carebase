import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { HepatitisBAttestationForm } from 'orm/entities/HepatitisBForm/attestationForm';
import { HepatitisBFullForm } from 'orm/entities/HepatitisBForm/HepatitisFullForm';
import { PersonalInformationHepatitisBForm } from 'orm/entities/HepatitisBForm/personalInformation';
import { HepatitisBSignatureForm } from 'orm/entities/HepatitisBForm/signatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveHepatitisBForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const HepatitisBFullFormRepository = getRepository(HepatitisBFullForm);
  const HepatitisBPersonalInformationRepository = getRepository(PersonalInformationHepatitisBForm);
  const HepatitisBSignatureFormRepository = getRepository(HepatitisBSignatureForm);
  const HepatitisBAttestationFormRepository = getRepository(HepatitisBAttestationForm);
  const user_id = req.user.id;

  try {
    const personalInformation = (await HepatitisBPersonalInformationRepository.findOne({ where: { user_id } })) || {};
    const signatureInformation =
      (await HepatitisBSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};
    const attestationInformation = (await HepatitisBAttestationFormRepository.findOne({ where: { user_id } })) || {};

    const hepatitisBFullForm = (await HepatitisBFullFormRepository.findOne({ where: { user_id } })) || {
      status: Status.NOT_STARTED,
    };

    return res.customSuccess(200, 'Hepatitis B form successfully retrieved.', {
      personalInformation,
      signatureInformation,
      attestationInformation,
      hepatitisBFullForm,
      status: hepatitisBFullForm.status,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
