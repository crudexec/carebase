import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TuberculosisSignatureForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFormSignature';
import { TuberculosisFullForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const signTbSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { signature_data } = req.body;
  const signed_by = req.user.id;
  const tuberculosisSignatureFormRepository = getRepository(TuberculosisSignatureForm);
  const tuberculosisFullFormRepository = getRepository(TuberculosisFullForm);

  try {
    const newTuberculosisSignatureForm = new TuberculosisSignatureForm();

    const tuberculosisSignatureForm = await tuberculosisSignatureFormRepository.findOne({ where: { signed_by } });

    if (tuberculosisSignatureForm) {
      const customError = new CustomError(400, 'General', 'Tuberculosis Signature form already exists', [
        `Tuberculosis Signature form already exists`,
      ]);
      return next(customError);
    }

    newTuberculosisSignatureForm.signature_data = signature_data;
    newTuberculosisSignatureForm.signed_by = signed_by;

    const savedTuberculosisSignatureForm = await tuberculosisSignatureFormRepository.save(newTuberculosisSignatureForm);

    if (savedTuberculosisSignatureForm) {
      const tuberculosisFullForm = await tuberculosisFullFormRepository.findOne({ where: { owner: signed_by } });
      if (tuberculosisFullForm) {
        tuberculosisFullForm.tb_signature_id = savedTuberculosisSignatureForm.id;
        await tuberculosisFullFormRepository.save(tuberculosisFullForm);
      } else {
        const newTuberculosisFullForm = new TuberculosisFullForm();
        newTuberculosisFullForm.owner = signed_by;
        newTuberculosisFullForm.tb_signature_id = savedTuberculosisSignatureForm.id;
        await tuberculosisFullFormRepository.save(newTuberculosisFullForm);
      }
    }

    return res.customSuccess(200, 'Tuberculosis Mantoux form successfully created.', savedTuberculosisSignatureForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
