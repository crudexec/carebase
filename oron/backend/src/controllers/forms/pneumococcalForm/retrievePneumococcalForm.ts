import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { EmployeeInformation } from 'orm/entities/PneumoccalVaccinationForm/employeeInformationForm';
import { PneumococcalSignatureForm } from 'orm/entities/PneumoccalVaccinationForm/pneumoccalSignature';
import { PneumococcalVaccinationFullForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm';
import { PneumococcalVaccinationForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalVaccinationForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrievePneumococcalVaccinationForm = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  const pneumococcalVaccinationFormRepository = getRepository(PneumococcalVaccinationForm);
  const employeeInformationRepository = getRepository(EmployeeInformation);
  const signatureRepository = getRepository(PneumococcalSignatureForm);
  const pneumococcalVaccinationFullFormRepository = getRepository(PneumococcalVaccinationFullForm);
  const signed_by = req.user.id;

  try {
    const employeeInformation = (await employeeInformationRepository.findOne({ where: { user_id: signed_by } })) || {};
    const signature = (await signatureRepository.findOne({ where: { signed_by } })) || {};
    const pneumococcalVaccinationForm =
      (await pneumococcalVaccinationFormRepository.findOne({ where: { user_id: signed_by } })) || {};
    const pneumococcalVaccinationFullForm = (await pneumococcalVaccinationFullFormRepository.findOne({
      where: { user_id: signed_by },
    })) || { status: Status.NOT_STARTED };

    return res.customSuccess(200, 'User pneumococcal vaccination form successfully retrieved.', {
      employeeInformation,
      signature,
      pneumococcalVaccinationForm,
      pneumococcalVaccinationFullForm,
      status: pneumococcalVaccinationFullForm.status,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
