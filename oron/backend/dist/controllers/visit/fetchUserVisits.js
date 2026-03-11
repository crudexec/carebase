"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserVisits = void 0;
const typeorm_1 = require("typeorm");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const types_1 = require("orm/entities/types");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fetchUserVisits = async (req, res, next) => {
    const visitRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
    const size = Number(req.query.size) || 10;
    const page = Number(req.query.page) || 1;
    const status = req.query.status;
    const user_id = req.user.id;
    const user_role = req.user.role;
    try {
        const whereClause = {};
        if (user_role === types_1.Role.STANDARD) {
            whereClause.registered_by = user_id;
        }
        if (status) {
            whereClause.status = status;
        }
        let query = visitRepository
            .createQueryBuilder('visit')
            .leftJoinAndSelect('visit.intakeFullForm', 'intakeFullForm')
            .leftJoinAndSelect('intakeFullForm.clientInformation', 'clientInformation')
            .leftJoinAndSelect('visit.user', 'user');
        if (user_role === types_1.Role.STANDARD) {
            query = query.where('visit.registered_by = :user_id', { user_id });
        }
        if (status) {
            query = query.andWhere('visit.status = :status', { status });
        }
        const [visits, total] = await query
            .orderBy('visit.created_at', 'DESC')
            .skip((page - 1) * size)
            .take(size)
            .getManyAndCount();
        const transformedVisits = visits.map((visit) => {
            const intakeForm = visit.intakeFullForm;
            const staffInfo = visit.user;
            let clientName = 'Unknown Client';
            if (intakeForm) {
                if (intakeForm.first_name || intakeForm.last_name) {
                    clientName = `${intakeForm.first_name || ''} ${intakeForm.last_name || ''}`.trim();
                }
                else if (intakeForm.clientInformation) {
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
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error fetching visits', null, err);
        return next(customError);
    }
};
exports.fetchUserVisits = fetchUserVisits;
//# sourceMappingURL=fetchUserVisits.js.map