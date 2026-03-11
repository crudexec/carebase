"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPendingVisits = void 0;
const typeorm_1 = require("typeorm");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fetchPendingVisits = async (req, res, next) => {
    const visitRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
    const size = Number(req.query.size) || 10;
    const page = Number(req.query.page) || 1;
    try {
        const [visits, total] = await visitRepository.findAndCount({
            where: { status: genericEnums_1.Status.AWAITING_APPROVAL },
            relations: ['intakeFullForm', 'intakeFullForm.clientInformation', 'user'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * size,
            take: size,
        });
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
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error fetching pending visits', null, err);
        return next(customError);
    }
};
exports.fetchPendingVisits = fetchPendingVisits;
//# sourceMappingURL=fetchPendingVisits.js.map