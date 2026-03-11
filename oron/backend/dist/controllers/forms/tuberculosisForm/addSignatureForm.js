"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTbSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const tuberculosisFormSignature_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisFormSignature");
const tuberculosisFullForm_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const signTbSignatureForm = async (req, res, next) => {
    const { signature_data } = req.body;
    const signed_by = req.user.id;
    const tuberculosisSignatureFormRepository = (0, typeorm_1.getRepository)(tuberculosisFormSignature_1.TuberculosisSignatureForm);
    const tuberculosisFullFormRepository = (0, typeorm_1.getRepository)(tuberculosisFullForm_1.TuberculosisFullForm);
    try {
        const newTuberculosisSignatureForm = new tuberculosisFormSignature_1.TuberculosisSignatureForm();
        const tuberculosisSignatureForm = await tuberculosisSignatureFormRepository.findOne({ where: { signed_by } });
        if (tuberculosisSignatureForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Tuberculosis Signature form already exists', [
                `Tuberculosis Signature form already exists`,
            ]);
            return next(customError);
        }
        newTuberculosisSignatureForm.signature_data = signature_data;
        newTuberculosisSignatureForm.signed_by = signed_by;
        const savedTuberculosisSignatureForm = await tuberculosisSignatureFormRepository.save(newTuberculosisSignatureForm);
        if (savedTuberculosisSignatureForm) {
            const tuberculosisFullForm = await tuberculosisFullFormRepository.findOne({ where: { owner: signed_by } });
            if (tuberculosisFullForm) {
                tuberculosisFullForm.tb_signature_id = savedTuberculosisSignatureForm.id;
                await tuberculosisFullFormRepository.save(tuberculosisFullForm);
            }
            else {
                const newTuberculosisFullForm = new tuberculosisFullForm_1.TuberculosisFullForm();
                newTuberculosisFullForm.owner = signed_by;
                newTuberculosisFullForm.tb_signature_id = savedTuberculosisSignatureForm.id;
                await tuberculosisFullFormRepository.save(newTuberculosisFullForm);
            }
        }
        return res.customSuccess(200, 'Tuberculosis Mantoux form successfully created.', savedTuberculosisSignatureForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.signTbSignatureForm = signTbSignatureForm;
//# sourceMappingURL=addSignatureForm.js.map