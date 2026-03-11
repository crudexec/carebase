import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PpdAdministrationForm } from 'orm/entities/Tuberculosis-MantouxForm/ppdAdministrationForm';
import { TuberculosisSignatureForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFormSignature';
import { TuberculosisFullForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm';
import { TuberculosisMantouxForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisTestingForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveTuberculosisForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const user_id = req.user.id;
  const tuberculosisFullFormRepository = getRepository(TuberculosisFullForm);
  const ppdAdministrationFormRepository = getRepository(PpdAdministrationForm);
  const tuberculosisSignatureFormRepository = getRepository(TuberculosisSignatureForm);
  const tuberculosisMantouxFormRepository = getRepository(TuberculosisMantouxForm);

  try {
    const tuberculosisFullForm = (await tuberculosisFullFormRepository.findOne({ where: { owner: user_id } })) || {
      status: Status.NOT_STARTED,
    };
    // const ppdAdministrationForm = (await ppdAdministrationFormRepository.findOne({ where: { user_id } })) || {};
    const tuberculosisSignatureForm =
      (await tuberculosisSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};
    const tuberculosisMantouxRiskAssessmentForm =
      (await tuberculosisMantouxFormRepository.findOne({ where: { owner: user_id } })) || {};

    return res.customSuccess(200, 'Tuberculosis form successfully retrieved.', {
      status: tuberculosisFullForm.status,
      // ppdAdministrationForm,
      tuberculosisSignatureForm,
      tuberculosisMantouxRiskAssessmentForm,
      tuberculosisFullForm,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
