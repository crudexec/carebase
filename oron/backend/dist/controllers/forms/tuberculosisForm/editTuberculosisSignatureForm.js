"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTbSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const tuberculosisFormSignature_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisFormSignature");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editTbSignatureForm = async (req, res, next) => {
    const { signature_data } = req.body;
    const signed_by = req.user.id;
    const tuberculosisSignatureFormRepository = (0, typeorm_1.getRepository)(tuberculosisFormSignature_1.TuberculosisSignatureForm);
    try {
        const newTuberculosisSignatureForm = new tuberculosisFormSignature_1.TuberculosisSignatureForm();
        const tuberculosisSignatureForm = await tuberculosisSignatureFormRepository.findOne({ where: { signed_by } });
        if (tuberculosisSignatureForm) {
            newTuberculosisSignatureForm.signature_data = signature_data;
            await tuberculosisSignatureFormRepository.update(tuberculosisSignatureForm.id, newTuberculosisSignatureForm);
            return res.customSuccess(200, 'Tuberculosis Mantoux form successfully created.', tuberculosisSignatureForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Tuberculosis Signature form already exists', [
                `Tuberculosis Signature form already exists`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editTbSignatureForm = editTbSignatureForm;
//# sourceMappingURL=editTuberculosisSignatureForm.js.map