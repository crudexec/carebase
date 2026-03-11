"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFcSignature = void 0;
const typeorm_1 = require("typeorm");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const fcSignature_1 = require("orm/entities/FCVisitLog/stepThree/fcSignature");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editFcSignature = async (req, res, next) => {
    try {
        let { signature_url, full_name, parent_signature_url, treatment_plan_signature_id } = req.body;
        const FcSignatureRepository = (0, typeorm_1.getRepository)(fcSignature_1.FcTreatmentPlanSignature);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(fcVisitFullForm_1.FcVisitFullForm);
        const alreadyExistingFcSignature = await FcSignatureRepository.findOne({
            where: { id: treatment_plan_signature_id, deleted_at: null },
        });
        if (!alreadyExistingFcSignature) {
            const customError = new CustomError_1.CustomError(404, 'General', `Signature not found`, ['Signature not found.']);
            return next(customError);
        }
        signature_url = signature_url ?? alreadyExistingFcSignature.signature_url;
        full_name = full_name ?? alreadyExistingFcSignature.full_name;
        parent_signature_url = parent_signature_url ?? alreadyExistingFcSignature.parent_signature_url;
        const FcSignature = new fcSignature_1.FcTreatmentPlanSignature();
        FcSignature.signature_url = signature_url;
        FcSignature.full_name = full_name;
        FcSignature.parent_signature_url = parent_signature_url;
        await FcSignatureRepository.update(treatment_plan_signature_id, FcSignature);
        return res.customSuccess(200, 'Signature successfully updated.', FcSignature);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding FC Signature', null, err);
        return next(customError);
    }
};
exports.editFcSignature = editFcSignature;
//# sourceMappingURL=editFcSignature.js.map