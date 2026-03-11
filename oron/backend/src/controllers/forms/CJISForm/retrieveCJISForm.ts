import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CJISEmployeeInformation } from 'orm/entities/CJISForm/cjisEmployeeInformation';
import { CJISFullForm } from 'orm/entities/CJISForm/cjisFullForm';
import { CJISPreRegistrationForm } from 'orm/entities/CJISForm/cjisPreRegistration';
import { CJISSignatureForm } from 'orm/entities/CJISForm/cjisSignature';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveCJISForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const cjisFullFormRepository = getRepository(CJISFullForm);
    const cjisEmployeeInformationRepository = getRepository(CJISEmployeeInformation);
    const cjisSignatureFormRepository = getRepository(CJISSignatureForm);
    const cjisForm = await cjisFullFormRepository.findOne({ where: { user_id } });
    const employeeInformation = await cjisEmployeeInformationRepository.findOne({
      where: { id: cjisForm.employee_information_id },
    });
    const signatureForm = await cjisSignatureFormRepository.findOne({ where: { id: cjisForm.signature_id } });
    const preRegistrationForm = await getRepository(CJISPreRegistrationForm).findOne({ where: { user_id } });

    if (cjisForm && employeeInformation && signatureForm) {
      return res.customSuccess(200, 'A Fully filled CJIS Form retrieved successfully.', {
        cjisForm,
        employeeInformation,
        signatureForm,
        preRegistrationForm,
      });
    }

    return res.customSuccess(200, 'CJIS Form retrieved successfully.', {
      cjisForm,
      employeeInformation,
      signatureForm,
      preRegistrationForm,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error retrieving CJIS Form', null, err);
    return next(customError);
  }
};
