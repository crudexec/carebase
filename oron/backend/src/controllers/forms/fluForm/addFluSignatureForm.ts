import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { FluFullForm } from 'orm/entities/FluForm/fluFullForm';
import { FluSignatureForm } from 'orm/entities/FluForm/fluSignatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addFluSignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const signed_by = req.user.id;
  const fluSignatureFormRepository = getRepository(FluSignatureForm);
  const fluFullFormRepository = getRepository(FluFullForm);

  const { signature_data } = req.body;

  try {
    const signatureForm = await fluSignatureFormRepository.findOne({ signed_by });

    if (signatureForm) {
      const customError = new CustomError(400, 'General', 'Flu signature form already exists', [
        `Flu signature form already exists`,
      ]);
      return next(customError);
    }

    const newSignatureForm = new FluSignatureForm();
    newSignatureForm.signature_data = signature_data;
    newSignatureForm.signed_by = signed_by;

    const savedSignatureForm = await fluSignatureFormRepository.save(newSignatureForm);

    if (savedSignatureForm) {
      const fluFullForm = await fluFullFormRepository.findOne({ where: { user_id: signed_by } });

      if (fluFullForm) {
        fluFullForm.signature_id = savedSignatureForm.id;
        fluFullForm.status = Status.IN_PROGRESS;
        await fluFullFormRepository.update(fluFullForm.id, fluFullForm);
      } else {
        const newFluFullForm = new FluFullForm();
        newFluFullForm.signature_id = savedSignatureForm.id;
        newFluFullForm.user_id = signed_by;
        newFluFullForm.status = Status.IN_PROGRESS;
        await fluFullFormRepository.save(newFluFullForm);
      }
    }

    return res.customSuccess(200, 'Flu signature form successfully created.', savedSignatureForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
