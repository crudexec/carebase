import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { FluFullForm } from 'orm/entities/FluForm/fluFullForm';
import { FluSignatureForm } from 'orm/entities/FluForm/fluSignatureForm';
import { FluEmployeeInformation } from 'orm/entities/FluForm/personalInformation';
import { FluAttestationForm } from 'orm/entities/FluForm/vaccineAttestationForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveFluFullForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const user_id = req.user.id;
  const fluSignatureFormRepository = getRepository(FluSignatureForm);
  const fluFullFormRepository = getRepository(FluFullForm);
  const fluAttestationFormRepository = getRepository(FluAttestationForm);
  const fluEmployeeInformationRepository = getRepository(FluEmployeeInformation);

  try {
    const fluFullForm = (await fluFullFormRepository.findOne({ where: { user_id } })) || { status: Status.NOT_STARTED };
    const fluSignatureForm = await fluSignatureFormRepository.findOne({ where: { signed_by: user_id } });
    const fluAttestationForm = await fluAttestationFormRepository.findOne({ where: { user_id } });
    const fluEmployeeInformation = await fluEmployeeInformationRepository.findOne({ where: { user_id } });

    return res.customSuccess(200, 'Flu full form successfully retrieved.', {
      fluFullForm,
      fluSignatureForm,
      fluAttestationForm,
      fluEmployeeInformation,
      status: fluFullForm.status,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
