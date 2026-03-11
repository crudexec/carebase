"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterVisitExport = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const User_1 = require("orm/entities/User");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const filterVisitExport = async (req, res, next) => {
    try {
        const registered_by = req.params.id;
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const visitDump = [];
        const { start_date, end_date } = req.query;
        const visitFullForm = await visitFullFormRepository.find({
            where: {
                registered_by,
                date_of_visit: (0, typeorm_1.Between)(start_date, end_date),
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
        return res.customSuccess(200, 'Visit Forms successfully retrieved for export.', visitDump);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error retrieving visit logs for export', null, err);
        return next(customError);
    }
};
exports.filterVisitExport = filterVisitExport;
//# sourceMappingURL=exportVisits.js.map