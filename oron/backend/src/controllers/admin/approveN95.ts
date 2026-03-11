import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { N95FitFullForm } from 'orm/entities/N95Form/n95FullForm';
import { Status } from 'types/genericEnums';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ApproveN95Form = async (req: Request, res: Response, next: NextFunction) => {
  const n95FitFullFormRepository = getRepository(N95FitFullForm);
  const form_id = req.params.id;
  try {
    const n95FitForm = await n95FitFullFormRepository.findOne({ where: { id: form_id } });

    if (!n95FitForm) {
      const customError = new CustomError(404, 'General', `N95 Form not found.`, ['N95 Form not found.']);
      return next(customError);
    }

    await n95FitFullFormRepository.update({ id: form_id }, { status: Status.APPROVED });

    return res.customSuccess(200, 'N95 Form successfully approved.', n95FitForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
