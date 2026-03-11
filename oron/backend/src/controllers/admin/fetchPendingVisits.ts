import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const fetchPendingVisits = async (req: Request, res: Response, next: NextFunction) => {
  const visitRepository = getRepository(VisitFullForm);
  const size = Number(req.query.size) || 10;
  const page = Number(req.query.page) || 1;

  try {
    const [visits, total] = await visitRepository.findAndCount({
      where: { status: Status.AWAITING_APPROVAL },
      relations: ['intakeFullForm', 'intakeFullForm.clientInformation', 'user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    // Transform visits data for frontend
    const transformedVisits = visits.map((visit) => {
      const intakeForm = visit.intakeFullForm;
      const staffInfo = visit.user;

      // Get client name from IntakeFullForm directly (first_name and last_name are on this entity)
      // If clientInformation exists, use it as fallback
      let clientName = 'Unknown Client';
      if (intakeForm) {
        if (intakeForm.first_name || intakeForm.last_name) {
          clientName = `${intakeForm.first_name || ''} ${intakeForm.last_name || ''}`.trim();
        } else if (intakeForm.clientInformation) {
          clientName = `${intakeForm.clientInformation.first_name || ''} ${intakeForm.clientInformation.last_name || ''}`.trim();
        }
      }

      return {
        id: visit.id,
        client_name: clientName,
        visit_type: visit.treatment_type || 'IISS Assessment',
        submitted_date: visit.created_at ? new Date(visit.created_at).toISOString() : null,
        staff_name: staffInfo
          ? `${staffInfo.first_name || ''} ${staffInfo.last_name || ''}`.trim()
          : 'Unknown Staff',
        status: visit.status,
      };
    });

    const response = {
      visits: transformedVisits,
      total,
      page,
      size,
    };

    return res.customSuccess(200, 'Pending visits fetched successfully', response);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error fetching pending visits', null, err);
    return next(customError);
  }
};
