import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { JwtPayload } from 'types/JwtPayload';
import { Role } from 'orm/entities/types';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ClientStaffAssignment } from 'orm/entities/ClientStaffAssignment';

interface RequestWithJwtPayload extends Request {
  user: JwtPayload;
}

export const fetchUserVisits = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  const visitRepository = getRepository(VisitFullForm);
  const size = Number(req.query.size) || 10;
  const page = Number(req.query.page) || 1;
  const status = req.query.status as string | undefined;
  const employee_id = req.query.employee_id as string | undefined;
  const client_id = req.query.client_id as string | undefined;
  const start_date = req.query.start_date as string | undefined;
  const end_date = req.query.end_date as string | undefined;
  const user_id = req.user.id;
  const user_role = req.user.role;

  try {
    // Use query builder for better relation handling
    let query = visitRepository
      .createQueryBuilder('visit')
      .leftJoinAndSelect('visit.intakeFullForm', 'intakeFullForm')
      .leftJoinAndSelect('intakeFullForm.clientInformation', 'clientInformation')
      .leftJoinAndSelect('visit.user', 'user');

    // Apply role-based filter
    if (user_role === Role.STANDARD) {
      // Get assigned client IDs for this staff member
      const assignmentRepository = getRepository(ClientStaffAssignment);
      const assignments = await assignmentRepository.find({
        where: { staff_id: user_id, is_active: true },
        select: ["client_id"],
      });

      const assignedClientIds = assignments.map(a => a.client_id);

      if (assignedClientIds.length === 0) {
        // Staff has no assignments, return empty result
        return res.customSuccess(200, 'Visits fetched successfully', {
          visits: [],
          total: 0,
          page,
          size,
        });
      }

      // Filter visits to only assigned clients
      query = query.where('visit.intake_full_id IN (:...assignedClientIds)', {
        assignedClientIds,
      });
    }

    // Filter by status if provided
    if (status) {
      if (user_role === Role.STANDARD) {
        query = query.andWhere('visit.status = :status', { status });
      } else {
        query = query.where('visit.status = :status', { status });
      }
    }

    // Filter by employee (admin only)
    if (employee_id && user_role !== Role.STANDARD) {
      query = query.andWhere('visit.registered_by = :employee_id', { employee_id });
    }

    // Filter by client
    if (client_id) {
      query = query.andWhere('visit.intake_full_id = :client_id', { client_id });
    }

    // Filter by date range
    if (start_date && end_date) {
      query = query.andWhere('visit.date_of_visit BETWEEN :start_date AND :end_date', {
        start_date,
        end_date,
      });
    } else if (start_date) {
      query = query.andWhere('visit.date_of_visit >= :start_date', { start_date });
    } else if (end_date) {
      query = query.andWhere('visit.date_of_visit <= :end_date', { end_date });
    }

    const [visits, total] = await query
      .orderBy('visit.created_at', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

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
        client_id: visit.intake_full_id || '',
        client_name: clientName,
        visit_type: visit.treatment_type || 'IISS Assessment',
        date_of_visit: visit.date_of_visit ? new Date(visit.date_of_visit).toISOString() : null,
        submitted_date: visit.created_at ? new Date(visit.created_at).toISOString() : null,
        staff_name: staffInfo
          ? `${staffInfo.first_name || ''} ${staffInfo.last_name || ''}`.trim()
          : 'Unknown Staff',
        status: visit.status,
        approved_at: visit.approved_at ? new Date(visit.approved_at).toISOString() : null,
      };
    });

    const response = {
      visits: transformedVisits,
      total,
      page,
      size,
    };

    return res.customSuccess(200, 'Visits fetched successfully', response);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error fetching visits', null, err);
    return next(customError);
  }
};
