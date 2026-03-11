import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { FcVisitFullForm } from 'orm/entities/FCVisitLog/fcVisitFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const deleteGenericVisit = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const visitFullFormRepository = getRepository(FcVisitFullForm);

    const { visit_full_form_id } = req.body;
    const account_id = req.user.account_id;

    const visitExists = await visitFullFormRepository.findOne({
      where: { id: visit_full_form_id, account_id, deleted_at: null },
    });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit form with this ${visit_full_form_id} does not exist`, [
        'Visit not found.',
      ]);
      return next(customError);
    }

    await visitFullFormRepository.softDelete({ id: visit_full_form_id });
    return res.customSuccess(200, 'Visit Successfully Deleted', null);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error Deleting Visit', null, err);
    return next(customError);
  }
};
