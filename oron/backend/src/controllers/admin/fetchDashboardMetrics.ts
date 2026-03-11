import { Request, Response, NextFunction } from 'express';
import { getRepository, Not } from 'typeorm';

import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { User } from 'orm/entities/User';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Role } from 'orm/entities/types';
import { IntakeFormStatus, Status } from 'types/genericEnums';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const fetchDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  const intakeRepository = getRepository(IntakeFullForm);
  const userRepository = getRepository(User);
  const visitRepository = getRepository(VisitFullForm);

  try {
    // Fetch all metrics in parallel for better performance
    const [clientsCount, employeesCount, pendingVisitsCount, recentSubmissionsCount] = await Promise.all([
      // Count active clients (not disengaged)
      intakeRepository.count({
        where: { status: Not(IntakeFormStatus.Disengage) },
      }),

      // Count active employees (STANDARD role)
      userRepository.count({
        where: { role: Role.STANDARD },
      }),

      // Count visits awaiting approval
      visitRepository.count({
        where: { status: Status.AWAITING_APPROVAL },
      }),

      // Count visits submitted in last 7 days
      visitRepository
        .createQueryBuilder('visit')
        .where('visit.created_at >= NOW() - INTERVAL \'7 days\'')
        .andWhere('visit.status != :draft', { draft: Status.DRAFT })
        .getCount(),
    ]);

    const metrics = {
      totalClients: clientsCount,
      totalEmployees: employeesCount,
      pendingApprovals: pendingVisitsCount,
      recentSubmissions: recentSubmissionsCount,
    };

    return res.customSuccess(200, 'Dashboard metrics fetched successfully', metrics);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error fetching dashboard metrics', null, err);
    return next(customError);
  }
};
