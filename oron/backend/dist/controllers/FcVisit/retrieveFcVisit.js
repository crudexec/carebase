"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveAllVisitLogs = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveAllVisitLogs = async (req, res, next) => {
    try {
        const intake_full_id = req.params.intake_full_id;
        const visitFullFormRepository = (0, typeorm_1.getRepository)(fcVisitFullForm_1.FcVisitFullForm);
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const visitDump = [];
        const visitFullForm = await visitFullFormRepository.find({
            where: { intake_full_id, deleted_at: null },
            order: { created_at: 'DESC' },
        });
        for (const visit of visitFullForm) {
            const user = await userRepository.findOne({ where: { id: visit.registered_by, deleted_at: null } });
            visit['staff'] = user;
            visitDump.push(visit);
        }
        return res.customSuccess(200, 'Visit Forms successfully retrieved.', visitDump);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error retrieving visit logs', null, err);
        return next(customError);
    }
};
exports.retrieveAllVisitLogs = retrieveAllVisitLogs;
//# sourceMappingURL=retrieveFcVisit.js.map