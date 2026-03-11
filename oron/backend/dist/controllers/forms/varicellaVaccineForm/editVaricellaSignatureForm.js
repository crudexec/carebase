"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editVaricellaSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const varicellaSignatureForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaSignatureForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editVaricellaSignatureForm = async (req, res, next) => {
    let { signature_data } = req.body;
    const signed_by = req.user.id;
    const VaricellaSignatureFormRepository = (0, typeorm_1.getRepository)(varicellaSignatureForm_1.VaricellaSignatureForm);
    try {
        const newVaricellaSignatureForm = new varicellaSignatureForm_1.VaricellaSignatureForm();
        const varicellaSignatureForm = await VaricellaSignatureFormRepository.findOne({ where: { signed_by } });
        if (varicellaSignatureForm) {
            signature_data = signature_data ?? varicellaSignatureForm.signature_data;
            newVaricellaSignatureForm.signature_data = signature_data;
            await VaricellaSignatureFormRepository.update(varicellaSignatureForm.id, newVaricellaSignatureForm);
            return res.customSuccess(200, 'Varicella Signature form successfully updated.', newVaricellaSignatureForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Varicella Signature form does not exist', [
                `Varicella Signature form does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editVaricellaSignatureForm = editVaricellaSignatureForm;
//# sourceMappingURL=editVaricellaSignatureForm.js.map