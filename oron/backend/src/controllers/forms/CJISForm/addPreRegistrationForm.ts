import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CJISFullForm } from 'orm/entities/CJISForm/cjisFullForm';
import { CJISPreRegistrationForm } from 'orm/entities/CJISForm/cjisPreRegistration';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addCJISPreRegistrationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const { pre_registration_pdf_url } = req.body;

  try {
    const preRegistrationRepository = getRepository(CJISPreRegistrationForm);
    const cjisFullFormRepository = getRepository(CJISFullForm);

    const user_id = req.user.id;

    const preRegistration = await preRegistrationRepository.findOne({ where: { user_id } });

    if (preRegistration) {
      const customError = new CustomError(400, 'General', 'CJIS Pre Registration Form already exists', [
        `CJIS Pre Registration Form already exists`,
      ]);
      return next(customError);
    }

    const newCJISPreRegistration = new CJISPreRegistrationForm();
    newCJISPreRegistration.user_id = user_id;
    newCJISPreRegistration.pre_registration_pdf_url = pre_registration_pdf_url;

    const savedCJISPreRegistration = await preRegistrationRepository.save(newCJISPreRegistration);

    if (savedCJISPreRegistration) {
      const newCJISForm = new CJISFullForm();
      const cjisForm = await cjisFullFormRepository.findOne({ where: { user_id } });
      if (cjisForm) {
        newCJISForm.pre_registration_id = savedCJISPreRegistration.id;
        newCJISForm.status = Status.IN_PROGRESS;
        await cjisFullFormRepository.update(cjisForm.id, newCJISForm);
        return res.customSuccess(200, 'CJIS Pre Registration Form successfully created.', savedCJISPreRegistration);
      }
      newCJISForm.pre_registration_id = savedCJISPreRegistration.id;
      newCJISForm.status = Status.IN_PROGRESS;
      await cjisFullFormRepository.save(newCJISForm);
      return res.customSuccess(200, 'CJIS Pre Registration Form successfully created.', savedCJISPreRegistration);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
