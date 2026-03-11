"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editInfluenzaSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const signatureForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/signatureForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editInfluenzaSignatureForm = async (req, res, next) => {
    let { signature_data } = req.body;
    const signed_by = req.user.id;
    const influenzaSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_1.InfluenzaSignatureForm);
    try {
        const signatureForm = await influenzaSignatureFormRepository.findOne({ where: { signed_by } });
        if (signatureForm) {
            signature_data = signature_data ?? signatureForm.signature_data;
            const newSignatureForm = new signatureForm_1.InfluenzaSignatureForm();
            newSignatureForm.signature_data = signature_data;
            await influenzaSignatureFormRepository.update(signatureForm.id, newSignatureForm);
            return res.customSuccess(200, 'Influenza signature form successfully updated.', newSignatureForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Influenza signature form does not exist', [
                `Influenza signature form does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editInfluenzaSignatureForm = editInfluenzaSignatureForm;
//# sourceMappingURL=editInfluenzaDeclinationFormSignature.js.map