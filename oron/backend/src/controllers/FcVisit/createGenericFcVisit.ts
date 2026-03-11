import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { FcVisitFullForm } from 'orm/entities/FCVisitLog/fcVisitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const createFcVisitLog = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const { date_of_visit, start_time, end_time, intake_full_id } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;
    const visitFullFormRepository = getRepository(FcVisitFullForm);

    const visitFullForm = new FcVisitFullForm();

    visitFullForm.date_of_visit = date_of_visit;
    visitFullForm.start_time = start_time;
    visitFullForm.end_time = end_time;
    visitFullForm.intake_full_id = intake_full_id;
    visitFullForm.account_id = account_id;
    visitFullForm.registered_by = registered_by;
    visitFullForm.status = Status.IN_PROGRESS;

    const savedVisitFullForm = await visitFullFormRepository.save(visitFullForm);

    return res.customSuccess(200, 'Visit Log successfully created.', savedVisitFullForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Creating Visit Log', null, err);
    return next(customError);
  }
};
