import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { N95FitSignatureForm } from 'orm/entities/N95Form/signatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editN95SignatureForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let { signature_data, full_name } = req.body;

  const user_id = req.user.id;

  const n95FitSignatureFormRepository = getRepository(N95FitSignatureForm);

  try {
    const signatureForm = await n95FitSignatureFormRepository.findOne({ where: { signed_by: user_id } });

    if (signatureForm) {
      signature_data = signature_data ?? signatureForm.signature_data;
      full_name = full_name ?? signatureForm.full_name;

      const newSignatureForm = new N95FitSignatureForm();
      newSignatureForm.signature_data = signature_data;
      newSignatureForm.full_name = full_name;

      await n95FitSignatureFormRepository.update(signatureForm.id, newSignatureForm);

      return res.customSuccess(200, 'N95 signature form successfully updated.', newSignatureForm);
    } else {
      const customError = new CustomError(400, 'General', 'N95 signature form does not exist', [
        `N95 signature form does not exist`,
      ]);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
