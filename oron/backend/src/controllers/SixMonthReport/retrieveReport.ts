import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { CustomError } from 'utils/response/custom-error/CustomError';

import { SixMonthReport } from 'orm/entities/SixMonthReport/SixMonthReport';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';

export const retrieveSingleReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return next(new CustomError(400, 'General', 'Report ID is required'));
    }

    const reportRepo = getRepository(SixMonthReport);
    
    const report = await reportRepo.findOne({
      where: { 
        id: reportId,
        deleted_at: null,
      },
      relations: ['treatmentPlan', 'intake', 'generatedBy', 'finalizedBy'],
    });

    if (!report) {
      return next(new CustomError(404, 'General', 'Report not found'));
    }

    // Check if user has permission to view this report
    // This could be expanded based on your permission system
    const userId = req.jwtPayload.id;
    const userRole = req.jwtPayload.role;
    
    // Add permission check logic here if needed
    // For example: if (userRole !== 'admin' && report.generated_by_id !== userId) { ... }

    res.customSuccess(200, 'Report retrieved successfully', report);
  } catch (error) {
    return next(new CustomError(500, 'General', 'Failed to retrieve report'));
  }
};

export const retrieveReportsByTreatmentPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { treatmentPlanId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!treatmentPlanId) {
      return next(new CustomError(400, 'General', 'Treatment Plan ID is required'));
    }

    const reportRepo = getRepository(SixMonthReport);
    const treatmentRepo = getRepository(TreatmentFullPlan);

    // Verify treatment plan exists
    const treatmentPlan = await treatmentRepo.findOne({
      where: { id: treatmentPlanId },
    });

    if (!treatmentPlan) {
      return next(new CustomError(404, 'General', 'Treatment plan not found'));
    }

    // Build query
    const queryBuilder = reportRepo.createQueryBuilder('report')
      .leftJoinAndSelect('report.generatedBy', 'generatedBy')
      .leftJoinAndSelect('report.finalizedBy', 'finalizedBy')
      .where('report.treatment_plan_id = :treatmentPlanId', { treatmentPlanId })
      .andWhere('report.deleted_at IS NULL');

    // Add status filter if provided
    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    // Add pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    queryBuilder
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .orderBy('report.created_at', 'DESC');

    const [reports, total] = await queryBuilder.getManyAndCount();

    res.customSuccess(200, 'Reports retrieved successfully', {
      reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return next(new CustomError(500, 'General', 'Failed to retrieve reports'));
  }
};

export const retrieveAllReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      report_type,
      start_date,
      end_date,
      intake_id,
    } = req.query;

    const reportRepo = getRepository(SixMonthReport);
    const queryBuilder = reportRepo.createQueryBuilder('report')
      .leftJoinAndSelect('report.treatmentPlan', 'treatmentPlan')
      .leftJoinAndSelect('report.intake', 'intake')
      .leftJoinAndSelect('intake.clientInformation', 'clientInformation')
      .leftJoinAndSelect('report.generatedBy', 'generatedBy')
      .where('report.deleted_at IS NULL');

    // Add filters
    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    if (report_type) {
      queryBuilder.andWhere('report.report_type = :report_type', { report_type });
    }

    if (intake_id) {
      queryBuilder.andWhere('report.intake_id = :intake_id', { intake_id });
    }

    if (start_date) {
      queryBuilder.andWhere('report.start_date >= :start_date', { start_date });
    }

    if (end_date) {
      queryBuilder.andWhere('report.end_date <= :end_date', { end_date });
    }

    // Check user role for access control
    const userRole = req.jwtPayload.role;
    const userId = req.jwtPayload.id;

    // If not admin, only show reports they generated
    if (userRole !== 'admin') {
      queryBuilder.andWhere('report.generated_by_id = :userId', { userId });
    }

    // Add pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    queryBuilder
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .orderBy('report.created_at', 'DESC');

    const [reports, total] = await queryBuilder.getManyAndCount();

    res.customSuccess(200, 'Reports retrieved successfully', {
      reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return next(new CustomError(500, 'General', 'Failed to retrieve reports'));
  }
};

export const getReportStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return next(new CustomError(400, 'General', 'Report ID is required'));
    }

    const reportRepo = getRepository(SixMonthReport);
    
    const report = await reportRepo.findOne({
      where: { 
        id: reportId,
        deleted_at: null,
      },
      select: ['id', 'status', 'created_at', 'updated_at'],
    });

    if (!report) {
      return next(new CustomError(404, 'General', 'Report not found'));
    }

    res.customSuccess(200, 'Report status retrieved successfully', {
      id: report.id,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.updated_at,
    });
  } catch (error) {
    return next(new CustomError(500, 'General', 'Failed to retrieve report status'));
  }
};

export const finalizeReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;
    const { supervisor_comments } = req.body;

    if (!reportId) {
      return next(new CustomError(400, 'General', 'Report ID is required'));
    }

    const reportRepo = getRepository(SixMonthReport);
    
    const report = await reportRepo.findOne({
      where: { 
        id: reportId,
        deleted_at: null,
      },
    });

    if (!report) {
      return next(new CustomError(404, 'General', 'Report not found'));
    }

    if (report.is_final) {
      return next(new CustomError(400, 'General', 'Report is already finalized'));
    }

    if (report.status !== 'completed') {
      return next(new CustomError(400, 'General', 'Report must be completed before finalizing'));
    }

    // Update report as final
    await reportRepo.update(reportId, {
      is_final: true,
      finalized_at: new Date(),
      finalized_by_id: req.jwtPayload.id,
      supervisor_comments: supervisor_comments || report.supervisor_comments,
      updated_at: new Date(),
    });

    res.customSuccess(200, 'Report finalized successfully');
  } catch (error) {
    return next(new CustomError(500, 'General', 'Failed to finalize report'));
  }
};

export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return next(new CustomError(400, 'General', 'Report ID is required'));
    }

    const reportRepo = getRepository(SixMonthReport);
    
    const report = await reportRepo.findOne({
      where: { 
        id: reportId,
        deleted_at: null,
      },
    });

    if (!report) {
      return next(new CustomError(404, 'General', 'Report not found'));
    }

    // Check if report is finalized
    if (report.is_final) {
      return next(new CustomError(400, 'General', 'Cannot delete finalized report'));
    }

    // Check permission (only admin or creator can delete)
    const userId = req.jwtPayload.id;
    const userRole = req.jwtPayload.role;
    
    if (userRole !== 'admin' && report.generated_by_id !== userId) {
      return next(new CustomError(403, 'Unauthorized', 'Unauthorized to delete this report'));
    }

    // Soft delete
    await reportRepo.update(reportId, {
      deleted_at: new Date(),
      updated_at: new Date(),
    });

    res.customSuccess(200, 'Report deleted successfully');
  } catch (error) {
    return next(new CustomError(500, 'General', 'Failed to delete report'));
  }
};