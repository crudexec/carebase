"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVaricellaSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const varicellaFullForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaFullForm");
const varicellaSignatureForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaSignatureForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addVaricellaSignatureForm = async (req, res, next) => {
    const { signature_data } = req.body;
    const signed_by = req.user.id;
    const VaricellaSignatureFormRepository = (0, typeorm_1.getRepository)(varicellaSignatureForm_1.VaricellaSignatureForm);
    const VaricellaFullFormRepository = (0, typeorm_1.getRepository)(varicellaFullForm_1.VaricellaFullForm);
    try {
        const newVaricellaSignatureForm = new varicellaSignatureForm_1.VaricellaSignatureForm();
        const varicellaSignatureForm = await VaricellaSignatureFormRepository.findOne({ where: { signed_by } });
        if (varicellaSignatureForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Varicella Signature form already exists', [
                `Varicella Signature form already exists`,
            ]);
            return next(customError);
        }
        newVaricellaSignatureForm.signature_data = signature_data;
        newVaricellaSignatureForm.signed_by = signed_by;
        const savedVaricellaSignatureForm = await VaricellaSignatureFormRepository.save(newVaricellaSignatureForm);
        if (savedVaricellaSignatureForm) {
            const varicellaFullForm = await VaricellaFullFormRepository.findOne({ where: { user_id: signed_by } });
            if (varicellaFullForm) {
                varicellaFullForm.signature_id = savedVaricellaSignatureForm.id;
                await VaricellaFullFormRepository.save(varicellaFullForm);
            }
            else {
                const newVaricellaFullForm = new varicellaFullForm_1.VaricellaFullForm();
                newVaricellaFullForm.user_id = signed_by;
                newVaricellaFullForm.signature_id = savedVaricellaSignatureForm.id;
                await VaricellaFullFormRepository.save(newVaricellaFullForm);
            }
        }
        return res.customSuccess(200, 'Varicella Vaccine form successfully created.', savedVaricellaSignatureForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addVaricellaSignatureForm = addVaricellaSignatureForm;
//# sourceMappingURL=addVaricellaSignatureForm.js.map