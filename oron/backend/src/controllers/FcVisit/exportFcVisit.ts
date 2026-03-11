import { Request, Response, NextFunction } from 'express';
import { getRepository, Between } from 'typeorm';
import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { User } from 'orm/entities/User';
import { FcVisitFullForm } from 'orm/entities/FCVisitLog/fcVisitFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const filterFcVisitExport = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const registered_by = req.params.id;
    const visitFullFormRepository = getRepository(FcVisitFullForm);
    const intakeFullFormRepository = getRepository(IntakeFullForm);
    const userRepository = getRepository(User);
    const visitDump = [];

    const { start_date, end_date } = req.query;

    const visitFullForm = await visitFullFormRepository.find({
      where: {
        registered_by,
        date_of_visit: Between(start_date, end_date),
        deleted_at: null,
      },
      order: { created_at: 'DESC' },
    });

    for (const visit of visitFullForm) {
      const user = await userRepository.findOne({ where: { id: visit.registered_by, deleted_at: null } });
      const intake = await intakeFullFormRepository.findOne({ where: { id: visit.intake_full_id, deleted_at: null } });
      visit['staff'] = user;
      visit['intake_client_details'] = intake;
      visitDump.push(visit);
    }

    return res.customSuccess(200, 'Fc Visit Forms successfully retrieved for export.', visitDump);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error retrieving FC visit logs for export', null, err);
    return next(customError);
  }
};
