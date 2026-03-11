"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addN95SignatureForm = void 0;
const typeorm_1 = require("typeorm");
const n95FullForm_1 = require("orm/entities/N95Form/n95FullForm");
const signatureForm_1 = require("orm/entities/N95Form/signatureForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addN95SignatureForm = async (req, res, next) => {
    const { signature_data, full_name, date_of_filling_form } = req.body;
    const user_id = req.user.id;
    const n95FitSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_1.N95FitSignatureForm);
    const n95FitFullFormRepository = (0, typeorm_1.getRepository)(n95FullForm_1.N95FitFullForm);
    try {
        const signatureForm = await n95FitSignatureFormRepository.findOne({ where: { signed_by: user_id } });
        if (signatureForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Signature form already exists', [
                `Signature form already exists`,
            ]);
            return next(customError);
        }
        const newSignatureForm = new signatureForm_1.N95FitSignatureForm();
        newSignatureForm.signature_data = signature_data;
        newSignatureForm.full_name = full_name;
        newSignatureForm.date_of_filling_form = date_of_filling_form;
        newSignatureForm.signed_by = user_id;
        const savedSignatureForm = await n95FitSignatureFormRepository.save(newSignatureForm);
        if (savedSignatureForm) {
            const fullForm = await n95FitFullFormRepository.findOne({ where: { user_id } });
            if (fullForm) {
                fullForm.signature_id = savedSignatureForm.id;
                await n95FitFullFormRepository.save(fullForm);
            }
            else {
                const newFullForm = new n95FullForm_1.N95FitFullForm();
                newFullForm.user_id = user_id;
                newFullForm.signature_id = savedSignatureForm.id;
                await n95FitFullFormRepository.save(newFullForm);
            }
        }
        return res.customSuccess(200, 'N95 signature form signed successfully.', savedSignatureForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addN95SignatureForm = addN95SignatureForm;
//# sourceMappingURL=addN95SignatureForm.js.map