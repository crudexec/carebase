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

export const uploadFilledI9Document = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const { filled_pdf_json_data } = req.body;
    const i9FormRepository = getRepository(I9Form);
    const i9Form = await i9FormRepository.findOne({ where: { owner: user_id } });

    if (i9Form) {
      const customError = new CustomError(400, 'General', 'I9 Form already exists', [`I9 Form already exists`]);
      return next(customError);
    }

    const newI9Form = new I9Form();
    newI9Form.owner = user_id;
    newI9Form.filled_pdf_json_data = filled_pdf_json_data;
    newI9Form.status = Status.IN_PROGRESS;
    await i9FormRepository.save(newI9Form);

    return res.customSuccess(200, 'I9 form successfully uploaded.', newI9Form);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error uploading i9 pdf document', null, err);
    return next(customError);
  }
};
