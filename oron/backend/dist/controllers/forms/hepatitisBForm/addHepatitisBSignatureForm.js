"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signHepatitisBSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const HepatitisFullForm_1 = require("orm/entities/HepatitisBForm/HepatitisFullForm");
const signatureForm_1 = require("orm/entities/HepatitisBForm/signatureForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const signHepatitisBSignatureForm = async (req, res, next) => {
    const { signature_data } = req.body;
    const HepatitisBSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_1.HepatitisBSignatureForm);
    const HepatitisBFullFormRepository = (0, typeorm_1.getRepository)(HepatitisFullForm_1.HepatitisBFullForm);
    const signed_by = req.user.id;
    try {
        const signatureForm = await HepatitisBSignatureFormRepository.findOne({ where: { signed_by } });
        if (signatureForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Signature form already exists', [
                `Signature form already exists`,
            ]);
            return next(customError);
        }
        const newSignatureForm = new signatureForm_1.HepatitisBSignatureForm();
        newSignatureForm.signature_data = signature_data;
        newSignatureForm.signed_by = signed_by;
        const savedSignatureForm = await HepatitisBSignatureFormRepository.save(newSignatureForm);
        if (savedSignatureForm) {
            const fullForm = await HepatitisBFullFormRepository.findOne({ where: { user_id: signed_by } });
            if (fullForm) {
                fullForm.signature_id = savedSignatureForm.id;
                await HepatitisBFullFormRepository.save(fullForm);
            }
            else {
                const newFullForm = new HepatitisFullForm_1.HepatitisBFullForm();
                newFullForm.user_id = signed_by;
                newFullForm.signature_id = savedSignatureForm.id;
                await HepatitisBFullFormRepository.save(newFullForm);
            }
        }
        return res.customSuccess(200, 'Hepatitis B form signed successfully.', savedSignatureForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.signHepatitisBSignatureForm = signHepatitisBSignatureForm;
//# sourceMappingURL=addHepatitisBSignatureForm.js.map