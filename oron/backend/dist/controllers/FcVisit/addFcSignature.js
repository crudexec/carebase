"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFcSignature = void 0;
const typeorm_1 = require("typeorm");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const fcSignature_1 = require("orm/entities/FCVisitLog/stepThree/fcSignature");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addFcSignature = async (req, res, next) => {
    try {
        const { signature_url, full_name, parent_signature_url, visit_full_form_id } = req.body;
        const FcSignatureRepository = (0, typeorm_1.getRepository)(fcSignature_1.FcTreatmentPlanSignature);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(fcVisitFullForm_1.FcVisitFullForm);
        const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
            return next(customError);
        }
        const FcSignature = new fcSignature_1.FcTreatmentPlanSignature();
        FcSignature.signature_url = signature_url;
        FcSignature.full_name = full_name;
        FcSignature.parent_signature_url = parent_signature_url;
        const savedFcSignature = await FcSignatureRepository.save(FcSignature);
        if (savedFcSignature) {
            await visitFullFormRepository.update(visit_full_form_id, { treatment_plan_signature_id: savedFcSignature.id });
        }
        return res.customSuccess(200, 'Signature successfully added.', savedFcSignature);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Family Discussion', null, err);
        return next(customError);
    }
};
exports.addFcSignature = addFcSignature;
//# sourceMappingURL=addFcSignature.js.map