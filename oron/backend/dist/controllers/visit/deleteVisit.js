"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGenericVisit = void 0;
const typeorm_1 = require("typeorm");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const deleteGenericVisit = async (req, res, next) => {
    try {
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
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
        await visitFullFormRepository.softDelete({ id: visit_full_form_id });
        return res.status(200).json({
            message: 'Visit Successfully Deleted',
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Deleting Visit', null, err);
        return next(customError);
    }
};
exports.deleteGenericVisit = deleteGenericVisit;
//# sourceMappingURL=deleteVisit.js.map