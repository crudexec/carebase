import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { I9Form } from 'orm/entities/i9Form/i9form';
import { User } from 'orm/entities/User';
import { Status } from 'types/genericEnums';
import { sendApproveMail } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const ApproveI9Form = async (req: Request, res: Response, next: NextFunction) => {
  const i9FormRepository = getRepository(I9Form);
  const userRepository = getRepository(User);

  const form_id = req.params.id;

  const { filled_pdf_json_data } = req.body;

  try {
    const i9Form = await i9FormRepository.findOne({ where: { id: form_id } });

    if (!i9Form) {
      const customError = new CustomError(404, 'General', `I9 Form not found.`, ['I9 Form not found.']);
      return next(customError);
    }

    const user = await userRepository.findOne({ where: { id: i9Form.owner } });

    if (!user) {
      const customError = new CustomError(404, 'General', `User not found.`, ['User not found.']);
      return next(customError);
    }

    await i9FormRepository.update({ id: form_id }, { status: Status.APPROVED, filled_pdf_json_data });

    await sendApproveMail(user.first_name, `I9 Form`, String(user.email));

    return res.customSuccess(200, 'I9 Form successfully approved.', i9Form);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
