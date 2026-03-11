"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editHepatitisBSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const signatureForm_1 = require("orm/entities/HepatitisBForm/signatureForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editHepatitisBSignatureForm = async (req, res, next) => {
    let { signature_data } = req.body;
    const HepatitisBSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_1.HepatitisBSignatureForm);
    const signed_by = req.user.id;
    try {
        const signatureForm = await HepatitisBSignatureFormRepository.findOne({ where: { signed_by } });
        if (signatureForm) {
            signature_data = signature_data || signatureForm.signature_data;
            const newSignatureForm = new signatureForm_1.HepatitisBSignatureForm();
            newSignatureForm.signature_data = signature_data;
            await HepatitisBSignatureFormRepository.update(signatureForm.id, newSignatureForm);
            return res.customSuccess(200, 'Emergency contact information successfully created.', newSignatureForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Signature form does not exist', [
                `Signature form does not exist`,
            ]);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editHepatitisBSignatureForm = editHepatitisBSignatureForm;
//# sourceMappingURL=editSignatureForm.js.map