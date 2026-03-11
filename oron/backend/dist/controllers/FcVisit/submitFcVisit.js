"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitGenericVisit = void 0;
const typeorm_1 = require("typeorm");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const submitGenericVisit = async (req, res, next) => {
    try {
        const visitFullFormRepository = (0, typeorm_1.getRepository)(fcVisitFullForm_1.FcVisitFullForm);
        const { visit_full_form_id } = req.body;
        const account_id = req.user.account_id;
        const visitExists = await visitFullFormRepository.findOne({
            where: { id: visit_full_form_id, account_id, deleted_at: null },
        });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit form with this ${visit_full_form_id} does not exist`, [
                'Visit not found.',
            ]);
            return next(customError);
        }
        await visitFullFormRepository.update({ id: visit_full_form_id }, {
            status: genericEnums_1.Status.COMPLETED,
        });
        return res.status(200).json({
            message: 'Visit Submitted Successfully',
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Submitting Visit', null, err);
        return next(customError);
    }
};
exports.submitGenericVisit = submitGenericVisit;
//# sourceMappingURL=submitFcVisit.js.map