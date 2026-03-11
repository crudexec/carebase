import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { CustomError } from 'utils/response/custom-error/CustomError';

import { SixMonthReport } from 'orm/entities/SixMonthReport/SixMonthReport';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';

export const retrieveSingleReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      const customError = new CustomError(400, 'General', 'Report ID is required');
      return next(customError);
    }

    const reportRepo = getRepository(SixMonthReport);

    const report = await reportRepo.findOne({
      where: {
        id: reportId,
        deleted_at: null,
      },
      relations: ['treatmentPlan', 'intake', 'intake.clientInformation', 'generatedBy', 'finalizedBy'],
    });

    if (!report) {
      const customError = new CustomError(404, 'General', 'Report not found');
      return next(customError);
    }

    // Transform report to include computed fields for frontend compatibility
    const transformedReport = {
      ...report,
      client_name: report.intake
        ? `${report.intake.first_name || ''} ${report.intake.last_name || ''}`.trim() || 'Unknown Client'
        : 'Unknown Client',
      clientFirstName: report.intake?.first_name || '',
      clientLastName: report.intake?.last_name || '',
      generated_by_name: report.generatedBy
        ? `${report.generatedBy.first_name || ''} ${report.generatedBy.last_name || ''}`.trim() || 'Unknown'
        : 'Unknown',
      generatedByFirstName: report.generatedBy?.first_name || '',
      generatedByLastName: report.generatedBy?.last_name || '',
      finalized_by_name: report.finalizedBy
        ? `${report.finalizedBy.first_name || ''} ${report.finalizedBy.last_name || ''}`.trim() || 'Unknown'
        : null,
      // Add camelCase aliases to nested objects for frontend compatibility
      intake: report.intake ? {
        ...report.intake,
        firstName: report.intake.first_name,
        lastName: report.intake.last_name,
        clientInformation: (report.intake as any).clientInformation ? {
          ...(report.intake as any).clientInformation,
          firstName: (report.intake as any).clientInformation.first_name,
          lastName: (report.intake as any).clientInformation.last_name,
        } : null,
      } : null,
      generatedBy: report.generatedBy ? {
        ...report.generatedBy,
        firstName: report.generatedBy.first_name,
        lastName: report.generatedBy.last_name,
      } : null,
      finalizedBy: report.finalizedBy ? {
        ...report.finalizedBy,
        firstName: report.finalizedBy.first_name,
        lastName: report.finalizedBy.last_name,
      } : null,
    };

    res.customSuccess(200, 'Report retrieved successfully', transformedReport);
  } catch (error) {
    const customError = new CustomError(500, 'General', 'Failed to retrieve report');
    return next(customError);
  }
};

export const retrieveReportsByTreatmentPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { treatmentPlanId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!treatmentPlanId) {
      const customError = new CustomError(400, 'General', 'Treatment Plan ID is required');
      return next(customError);
    }

    const reportRepo = getRepository(SixMonthReport);
    const treatmentRepo = getRepository(TreatmentFullPlan);

    // Verify treatment plan exists
    const treatmentPlan = await treatmentRepo.findOne({
      where: { id: treatmentPlanId },
    });

    if (!treatmentPlan) {
      const customError = new CustomError(404, 'General', 'Treatment plan not found');
      return next(customError);
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
    const customError = new CustomError(500, 'General', 'Failed to retrieve reports');
    return next(customError);
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

    console.log('=== RETRIEVE ALL REPORTS ===');
    console.log('Reports found:', reports.length);
    if (reports.length > 0) {
      console.log('First report intake:', reports[0].intake);
      console.log('First report generatedBy:', reports[0].generatedBy);
    }

    // Transform reports to include computed fields for frontend compatibility
    const transformedReports = reports.map(report => ({
      ...report,
      // Add client name fields at root level
      client_name: report.intake
        ? `${report.intake.first_name || ''} ${report.intake.last_name || ''}`.trim() || 'Unknown Client'
        : 'Unknown Client',
      clientFirstName: report.intake?.first_name || '',
      clientLastName: report.intake?.last_name || '',
      // Add generated by name fields at root level
      generated_by_name: report.generatedBy
        ? `${report.generatedBy.first_name || ''} ${report.generatedBy.last_name || ''}`.trim() || 'Unknown'
        : 'Unknown',
      generatedByFirstName: report.generatedBy?.first_name || '',
      generatedByLastName: report.generatedBy?.last_name || '',
      // Add camelCase aliases to nested objects for frontend compatibility
      intake: report.intake ? {
        ...report.intake,
        firstName: report.intake.first_name,
        lastName: report.intake.last_name,
        // Add clientInformation with camelCase aliases
        clientInformation: (report.intake as any).clientInformation ? {
          ...(report.intake as any).clientInformation,
          firstName: (report.intake as any).clientInformation.first_name,
          lastName: (report.intake as any).clientInformation.last_name,
        } : null,
      } : null,
      generatedBy: report.generatedBy ? {
        ...report.generatedBy,
        firstName: report.generatedBy.first_name,
        lastName: report.generatedBy.last_name,
      } : null,
    }));

    console.log('First transformed report client_name:', transformedReports[0]?.client_name);
    console.log('First transformed report intake.clientInformation:', (transformedReports[0]?.intake as any)?.clientInformation);
    console.log('First transformed report generated_by_name:', transformedReports[0]?.generated_by_name);

    res.customSuccess(200, 'Reports retrieved successfully', {
      reports: transformedReports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    const customError = new CustomError(500, 'General', 'Failed to retrieve reports');
    return next(customError);
  }
};

export const getReportStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      const customError = new CustomError(400, 'General', 'Report ID is required');
      return next(customError);
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
      const customError = new CustomError(404, 'General', 'Report not found');
      return next(customError);
    }

    res.customSuccess(200, 'Report status retrieved successfully', {
      id: report.id,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.updated_at,
    });
  } catch (error) {
    const customError = new CustomError(500, 'General', 'Failed to retrieve report status');
    return next(customError);
  }
};

export const finalizeReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;
    const { supervisor_comments } = req.body;

    if (!reportId) {
      const customError = new CustomError(400, 'General', 'Report ID is required');
      return next(customError);
    }

    const reportRepo = getRepository(SixMonthReport);
    
    const report = await reportRepo.findOne({
      where: { 
        id: reportId,
        deleted_at: null,
      },
    });

    if (!report) {
      const customError = new CustomError(404, 'General', 'Report not found');
      return next(customError);
    }

    if (report.is_final) {
      const customError = new CustomError(400, 'General', 'Report is already finalized');
      return next(customError);
    }

    if (report.status !== 'completed') {
      const customError = new CustomError(400, 'General', 'Report must be completed before finalizing');
      return next(customError);
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
    const customError = new CustomError(500, 'General', 'Failed to finalize report');
    return next(customError);
  }
};

export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      const customError = new CustomError(400, 'General', 'Report ID is required');
      return next(customError);
    }

    const reportRepo = getRepository(SixMonthReport);
    
    const report = await reportRepo.findOne({
      where: { 
        id: reportId,
        deleted_at: null,
      },
    });

    if (!report) {
      const customError = new CustomError(404, 'General', 'Report not found');
      return next(customError);
    }

    // Check if report is finalized
    if (report.is_final) {
      const customError = new CustomError(400, 'General', 'Cannot delete finalized report');
      return next(customError);
    }

    // Check permission (only admin or creator can delete)
    const userId = req.jwtPayload.id;
    const userRole = req.jwtPayload.role;
    
    if (userRole !== 'admin' && report.generated_by_id !== userId) {
      const customError = new CustomError(403, 'Unauthorized', 'Unauthorized to delete this report');
      return next(customError);
    }

    // Soft delete
    await reportRepo.update(reportId, {
      deleted_at: new Date(),
      updated_at: new Date(),
    });

    res.customSuccess(200, 'Report deleted successfully');
  } catch (error) {
    const customError = new CustomError(500, 'General', 'Failed to delete report');
    return next(customError);
  }
};