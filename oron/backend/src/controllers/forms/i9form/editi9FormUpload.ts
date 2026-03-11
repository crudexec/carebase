import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { I9Form } from 'orm/entities/i9Form/i9form';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editFilledI9Document = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    let { filled_pdf_json_data } = req.body;
    const i9FormRepository = getRepository(I9Form);
    const i9Form = await i9FormRepository.findOne({ where: { owner: user_id } });

    if (!i9Form) {
      const customError = new CustomError(400, 'General', 'I9 form does not exist', [`I9 form does not exist`]);
      return next(customError);
    }

    filled_pdf_json_data = filled_pdf_json_data ?? i9Form.filled_pdf_json_data;

    const updatedI9Form = new I9Form();
    updatedI9Form.filled_pdf_json_data = filled_pdf_json_data;
    updatedI9Form.status = Status.AWAITING_APPROVAL;

    await i9FormRepository.update(i9Form.id, updatedI9Form);

    return res.customSuccess(200, 'I9 form successfully updated.', updatedI9Form);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error editing uploaded i9 pdf document', null, err);
    return next(customError);
  }
};
