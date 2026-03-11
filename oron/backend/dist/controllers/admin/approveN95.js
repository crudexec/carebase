"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveN95Form = void 0;
const typeorm_1 = require("typeorm");
const n95FullForm_1 = require("orm/entities/N95Form/n95FullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ApproveN95Form = async (req, res, next) => {
    const n95FitFullFormRepository = (0, typeorm_1.getRepository)(n95FullForm_1.N95FitFullForm);
    const form_id = req.params.id;
    try {
        const n95FitForm = await n95FitFullFormRepository.findOne({ where: { id: form_id } });
        if (!n95FitForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `N95 Form not found.`, ['N95 Form not found.']);
            return next(customError);
        }
        await n95FitFullFormRepository.update({ id: form_id }, { status: genericEnums_1.Status.APPROVED });
        return res.customSuccess(200, 'N95 Form successfully approved.', n95FitForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.ApproveN95Form = ApproveN95Form;
//# sourceMappingURL=approveN95.js.map