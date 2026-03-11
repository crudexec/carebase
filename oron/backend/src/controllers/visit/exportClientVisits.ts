import { Request, Response, NextFunction } from 'express';
import { getRepository, Between } from 'typeorm';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const filterClientVisitExport = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clientId = req.params.clientId;
    const visitFullFormRepository = getRepository(VisitFullForm);

    const { start_date, end_date } = req.query;

    // Optimized: Use relations to fetch user and intake in a single query
    const visitFullForm = await visitFullFormRepository.find({
      where: {
        intake_full_id: clientId,
        date_of_visit: Between(start_date, end_date),
        deleted_at: null,
      },
      relations: ['user', 'intakeFullForm'],
      order: { created_at: 'DESC' },
    });

    // Map to expected format
    const visitDump = visitFullForm.map((visit) => ({
      ...visit,
      staff: visit.user,
      intake_client_details: visit.intakeFullForm,
    }));

    return res.customSuccess(200, 'Visit Forms successfully retrieved for export.', visitDump);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error retrieving visit logs for export', null, err);
    return next(customError);
  }
};
