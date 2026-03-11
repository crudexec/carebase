import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TuberculosisSignatureForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFormSignature';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editTbSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { signature_data } = req.body;
  const signed_by = req.user.id;
  const tuberculosisSignatureFormRepository = getRepository(TuberculosisSignatureForm);

  try {
    const newTuberculosisSignatureForm = new TuberculosisSignatureForm();

    const tuberculosisSignatureForm = await tuberculosisSignatureFormRepository.findOne({ where: { signed_by } });

    if (tuberculosisSignatureForm) {
      newTuberculosisSignatureForm.signature_data = signature_data;

      await tuberculosisSignatureFormRepository.update(tuberculosisSignatureForm.id, newTuberculosisSignatureForm);

      return res.customSuccess(200, 'Tuberculosis Mantoux form successfully created.', tuberculosisSignatureForm);
    } else {
      const customError = new CustomError(400, 'General', 'Tuberculosis Signature form already exists', [
        `Tuberculosis Signature form already exists`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
