"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFluSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const fluSignatureForm_1 = require("orm/entities/FluForm/fluSignatureForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editFluSignatureForm = async (req, res, next) => {
    const signed_by = req.user.id;
    const fluSignatureFormRepository = (0, typeorm_1.getRepository)(fluSignatureForm_1.FluSignatureForm);
    let { signature_data } = req.body;
    try {
        const signatureForm = await fluSignatureFormRepository.findOne({ signed_by });
        if (signatureForm) {
            signature_data = signature_data ?? signatureForm.signature_data;
            const newSignatureForm = new fluSignatureForm_1.FluSignatureForm();
            newSignatureForm.signature_data = signature_data;
            await fluSignatureFormRepository.update(signatureForm.id, newSignatureForm);
            return res.customSuccess(200, 'Flu signature form successfully updated.', newSignatureForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Flu signature form does not exist', [
                `Flu signature form does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editFluSignatureForm = editFluSignatureForm;
//# sourceMappingURL=editFluSignatureForm.js.map