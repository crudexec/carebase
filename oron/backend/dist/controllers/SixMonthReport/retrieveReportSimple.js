"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReport = exports.finalizeReport = exports.getReportStatus = exports.retrieveAllReports = exports.retrieveReportsByTreatmentPlan = exports.retrieveSingleReport = void 0;
const typeorm_1 = require("typeorm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const SixMonthReport_1 = require("orm/entities/SixMonthReport/SixMonthReport");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const retrieveSingleReport = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        if (!reportId) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Report ID is required');
            return next(customError);
        }
        const reportRepo = (0, typeorm_1.getRepository)(SixMonthReport_1.SixMonthReport);
        const report = await reportRepo.findOne({
            where: {
                id: reportId,
                deleted_at: null,
            },
            relations: ['treatmentPlan', 'intake', 'intake.clientInformation', 'generatedBy', 'finalizedBy'],
        });
        if (!report) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Report not found');
            return next(customError);
        }
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
            intake: report.intake ? {
                ...report.intake,
                firstName: report.intake.first_name,
                lastName: report.intake.last_name,
                clientInformation: report.intake.clientInformation ? {
                    ...report.intake.clientInformation,
                    firstName: report.intake.clientInformation.first_name,
                    lastName: report.intake.clientInformation.last_name,
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
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(500, 'General', 'Failed to retrieve report');
        return next(customError);
    }
};
exports.retrieveSingleReport = retrieveSingleReport;
const retrieveReportsByTreatmentPlan = async (req, res, next) => {
    try {
        const { treatmentPlanId } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        if (!treatmentPlanId) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Treatment Plan ID is required');
            return next(customError);
        }
        const reportRepo = (0, typeorm_1.getRepository)(SixMonthReport_1.SixMonthReport);
        const treatmentRepo = (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const treatmentPlan = await treatmentRepo.findOne({
            where: { id: treatmentPlanId },
        });
        if (!treatmentPlan) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Treatment plan not found');
            return next(customError);
        }
        const queryBuilder = reportRepo.createQueryBuilder('report')
            .leftJoinAndSelect('report.generatedBy', 'generatedBy')
            .leftJoinAndSelect('report.finalizedBy', 'finalizedBy')
            .where('report.treatment_plan_id = :treatmentPlanId', { treatmentPlanId })
            .andWhere('report.deleted_at IS NULL');
        if (status) {
            queryBuilder.andWhere('report.status = :status', { status });
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
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
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(500, 'General', 'Failed to retrieve reports');
        return next(customError);
    }
};
exports.retrieveReportsByTreatmentPlan = retrieveReportsByTreatmentPlan;
const retrieveAllReports = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, report_type, start_date, end_date, intake_id, } = req.query;
        const reportRepo = (0, typeorm_1.getRepository)(SixMonthReport_1.SixMonthReport);
        const queryBuilder = reportRepo.createQueryBuilder('report')
            .leftJoinAndSelect('report.treatmentPlan', 'treatmentPlan')
            .leftJoinAndSelect('report.intake', 'intake')
            .leftJoinAndSelect('intake.clientInformation', 'clientInformation')
            .leftJoinAndSelect('report.generatedBy', 'generatedBy')
            .where('report.deleted_at IS NULL');
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
        const userRole = req.jwtPayload.role;
        const userId = req.jwtPayload.id;
        if (userRole !== 'admin') {
            queryBuilder.andWhere('report.generated_by_id = :userId', { userId });
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
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
        const transformedReports = reports.map(report => ({
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
            intake: report.intake ? {
                ...report.intake,
                firstName: report.intake.first_name,
                lastName: report.intake.last_name,
                clientInformation: report.intake.clientInformation ? {
                    ...report.intake.clientInformation,
                    firstName: report.intake.clientInformation.first_name,
                    lastName: report.intake.clientInformation.last_name,
                } : null,
            } : null,
            generatedBy: report.generatedBy ? {
                ...report.generatedBy,
                firstName: report.generatedBy.first_name,
                lastName: report.generatedBy.last_name,
            } : null,
        }));
        console.log('First transformed report client_name:', transformedReports[0]?.client_name);
        console.log('First transformed report intake.clientInformation:', transformedReports[0]?.intake?.clientInformation);
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
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(500, 'General', 'Failed to retrieve reports');
        return next(customError);
    }
};
exports.retrieveAllReports = retrieveAllReports;
const getReportStatus = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        if (!reportId) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Report ID is required');
            return next(customError);
        }
        const reportRepo = (0, typeorm_1.getRepository)(SixMonthReport_1.SixMonthReport);
        const report = await reportRepo.findOne({
            where: {
                id: reportId,
                deleted_at: null,
            },
            select: ['id', 'status', 'created_at', 'updated_at'],
        });
        if (!report) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Report not found');
            return next(customError);
        }
        res.customSuccess(200, 'Report status retrieved successfully', {
            id: report.id,
            status: report.status,
            created_at: report.created_at,
            updated_at: report.updated_at,
        });
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(500, 'General', 'Failed to retrieve report status');
        return next(customError);
    }
};
exports.getReportStatus = getReportStatus;
const finalizeReport = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        const { supervisor_comments } = req.body;
        if (!reportId) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Report ID is required');
            return next(customError);
        }
        const reportRepo = (0, typeorm_1.getRepository)(SixMonthReport_1.SixMonthReport);
        const report = await reportRepo.findOne({
            where: {
                id: reportId,
                deleted_at: null,
            },
        });
        if (!report) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Report not found');
            return next(customError);
        }
        if (report.is_final) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Report is already finalized');
            return next(customError);
        }
        if (report.status !== 'completed') {
            const customError = new CustomError_1.CustomError(400, 'General', 'Report must be completed before finalizing');
            return next(customError);
        }
        await reportRepo.update(reportId, {
            is_final: true,
            finalized_at: new Date(),
            finalized_by_id: req.jwtPayload.id,
            supervisor_comments: supervisor_comments || report.supervisor_comments,
            updated_at: new Date(),
        });
        res.customSuccess(200, 'Report finalized successfully');
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(500, 'General', 'Failed to finalize report');
        return next(customError);
    }
};
exports.finalizeReport = finalizeReport;
const deleteReport = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        if (!reportId) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Report ID is required');
            return next(customError);
        }
        const reportRepo = (0, typeorm_1.getRepository)(SixMonthReport_1.SixMonthReport);
        const report = await reportRepo.findOne({
            where: {
                id: reportId,
                deleted_at: null,
            },
        });
        if (!report) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Report not found');
            return next(customError);
        }
        if (report.is_final) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Cannot delete finalized report');
            return next(customError);
        }
        const userId = req.jwtPayload.id;
        const userRole = req.jwtPayload.role;
        if (userRole !== 'admin' && report.generated_by_id !== userId) {
            const customError = new CustomError_1.CustomError(403, 'Unauthorized', 'Unauthorized to delete this report');
            return next(customError);
        }
        await reportRepo.update(reportId, {
            deleted_at: new Date(),
            updated_at: new Date(),
        });
        res.customSuccess(200, 'Report deleted successfully');
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(500, 'General', 'Failed to delete report');
        return next(customError);
    }
};
exports.deleteReport = deleteReport;
//# sourceMappingURL=retrieveReportSimple.js.map