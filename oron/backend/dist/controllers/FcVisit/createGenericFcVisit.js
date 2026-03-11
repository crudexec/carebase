"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFcVisitLog = void 0;
const typeorm_1 = require("typeorm");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const createFcVisitLog = async (req, res, next) => {
    try {
        const { date_of_visit, start_time, end_time, intake_full_id } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const visitFullFormRepository = (0, typeorm_1.getRepository)(fcVisitFullForm_1.FcVisitFullForm);
        const visitFullForm = new fcVisitFullForm_1.FcVisitFullForm();
        visitFullForm.date_of_visit = date_of_visit;
        visitFullForm.start_time = start_time;
        visitFullForm.end_time = end_time;
        visitFullForm.intake_full_id = intake_full_id;
        visitFullForm.account_id = account_id;
        visitFullForm.registered_by = registered_by;
        visitFullForm.status = genericEnums_1.Status.IN_PROGRESS;
        const savedVisitFullForm = await visitFullFormRepository.save(visitFullForm);
        return res.customSuccess(200, 'Visit Log successfully created.', savedVisitFullForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Creating Visit Log', null, err);
        return next(customError);
    }
};
exports.createFcVisitLog = createFcVisitLog;
//# sourceMappingURL=createGenericFcVisit.js.map