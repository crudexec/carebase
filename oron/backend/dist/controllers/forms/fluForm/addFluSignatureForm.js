"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFluSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const fluFullForm_1 = require("orm/entities/FluForm/fluFullForm");
const fluSignatureForm_1 = require("orm/entities/FluForm/fluSignatureForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addFluSignatureForm = async (req, res, next) => {
    const signed_by = req.user.id;
    const fluSignatureFormRepository = (0, typeorm_1.getRepository)(fluSignatureForm_1.FluSignatureForm);
    const fluFullFormRepository = (0, typeorm_1.getRepository)(fluFullForm_1.FluFullForm);
    const { signature_data } = req.body;
    try {
        const signatureForm = await fluSignatureFormRepository.findOne({ signed_by });
        if (signatureForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Flu signature form already exists', [
                `Flu signature form already exists`,
            ]);
            return next(customError);
        }
        const newSignatureForm = new fluSignatureForm_1.FluSignatureForm();
        newSignatureForm.signature_data = signature_data;
        newSignatureForm.signed_by = signed_by;
        const savedSignatureForm = await fluSignatureFormRepository.save(newSignatureForm);
        if (savedSignatureForm) {
            const fluFullForm = await fluFullFormRepository.findOne({ where: { user_id: signed_by } });
            if (fluFullForm) {
                fluFullForm.signature_id = savedSignatureForm.id;
                fluFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await fluFullFormRepository.update(fluFullForm.id, fluFullForm);
            }
            else {
                const newFluFullForm = new fluFullForm_1.FluFullForm();
                newFluFullForm.signature_id = savedSignatureForm.id;
                newFluFullForm.user_id = signed_by;
                newFluFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await fluFullFormRepository.save(newFluFullForm);
            }
        }
        return res.customSuccess(200, 'Flu signature form successfully created.', savedSignatureForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addFluSignatureForm = addFluSignatureForm;
//# sourceMappingURL=addFluSignatureForm.js.map