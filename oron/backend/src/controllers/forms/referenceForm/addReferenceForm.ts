import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { ReferenceForm } from 'orm/entities/ReferenceForm/reference';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addReferenceForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const {
      referrer_one_firstname,
      referrer_one_lastname,
      referrer_one_email,
      referrer_one_phone,
      referrer_two_firstname,
      referrer_two_lastname,
      referrer_two_email,
      referrer_two_phone,
      referrer_three_firstname,
      referrer_three_lastname,
      referrer_three_email,
      referrer_three_phone,
    } = req.body;

    const referenceFormRepository = getRepository(ReferenceForm);

    const referenceForm = await referenceFormRepository.findOne({ where: { user_id } });

    if (referenceForm) {
      const customError = new CustomError(400, 'General', 'Reference form already exists', [
        `Reference form already exists`,
      ]);
      return next(customError);
    }

    const newReferenceForm = new ReferenceForm();

    newReferenceForm.referrer_one_firstname = referrer_one_firstname;
    newReferenceForm.referrer_one_lastname = referrer_one_lastname;
    newReferenceForm.referrer_one_email = referrer_one_email;
    newReferenceForm.referrer_one_phone = referrer_one_phone;
    newReferenceForm.referrer_two_firstname = referrer_two_firstname;
    newReferenceForm.referrer_two_lastname = referrer_two_lastname;
    newReferenceForm.referrer_two_email = referrer_two_email;
    newReferenceForm.referrer_two_phone = referrer_two_phone;
    newReferenceForm.referrer_three_firstname = referrer_three_firstname;
    newReferenceForm.referrer_three_lastname = referrer_three_lastname;
    newReferenceForm.referrer_three_email = referrer_three_email;
    newReferenceForm.referrer_three_phone = referrer_three_phone;
    newReferenceForm.status = Status.IN_PROGRESS;

    newReferenceForm.user_id = user_id;

    const savedReferenceForm = await referenceFormRepository.save(newReferenceForm);

    return res.customSuccess(200, 'Reference form successfully created.', savedReferenceForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error while creating reference form', null, err);
    return next(customError);
  }
};
