import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CitizenshipForm } from 'orm/entities/i9Form/citizenship';
import { Documents } from 'orm/entities/i9Form/document';
import { I9Form } from 'orm/entities/i9Form/i9form';
import { PersonalInformation } from 'orm/entities/i9Form/personalInformation';
import { Signature } from 'orm/entities/i9Form/signature';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const retrieveI9Form = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const user_id = req.user.id;
  try {
    const personalInformationRepository = getRepository(PersonalInformation);
    const citizenshipRepository = getRepository(CitizenshipForm);
    const signatureRepository = getRepository(Signature);
    const documentRepository = getRepository(Documents);
    const i9FormRepository = getRepository(I9Form);

    const personalInformation = (await personalInformationRepository.findOne({ where: { user_id } })) || {};
    const citizenship = (await citizenshipRepository.findOne({ where: { owner: user_id } })) || {};
    const signature = (await signatureRepository.findOne({ where: { signed_by: user_id } })) || {};
    const documents = (await documentRepository.find({ where: { owner: user_id } })) || {};
    const i9Form = (await i9FormRepository.findOne({ where: { owner: user_id } })) || { status: Status.NOT_STARTED };

    return res.customSuccess(200, 'User I9 form data found', {
      personalInformation,
      citizenship,
      signature,
      documents,
      status: i9Form.status,
      i9Form,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
