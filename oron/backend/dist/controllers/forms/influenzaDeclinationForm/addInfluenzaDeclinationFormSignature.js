"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addInfluenzaSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const influenzaDeclinationFullForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm");
const signatureForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/signatureForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addInfluenzaSignatureForm = async (req, res, next) => {
    const { signature_data } = req.body;
    const signed_by = req.user.id;
    const influenzaSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_1.InfluenzaSignatureForm);
    const influenzaVaccinationDeclinationFullFormRepository = (0, typeorm_1.getRepository)(influenzaDeclinationFullForm_1.InfluenzaVaccinationDeclinationFullForm);
    try {
        const signatureForm = await influenzaSignatureFormRepository.findOne({ where: { signed_by } });
        if (signatureForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Influenza signature form already exists', [
                `Influenza signature form already exists`,
            ]);
            return next(customError);
        }
        const newSignatureForm = new signatureForm_1.InfluenzaSignatureForm();
        newSignatureForm.signature_data = signature_data;
        newSignatureForm.signed_by = signed_by;
        const savedSignatureForm = await influenzaSignatureFormRepository.save(newSignatureForm);
        if (savedSignatureForm) {
            const influenzaVaccinationDeclinationFullForm = await influenzaVaccinationDeclinationFullFormRepository.findOne({
                where: { user_id: signed_by },
            });
            if (influenzaVaccinationDeclinationFullForm) {
                influenzaVaccinationDeclinationFullForm.signature_id = savedSignatureForm.id;
                await influenzaVaccinationDeclinationFullFormRepository.update(influenzaVaccinationDeclinationFullForm.id, influenzaVaccinationDeclinationFullForm);
            }
            else {
                const newInfluenzaVaccinationDeclinationFullForm = new influenzaDeclinationFullForm_1.InfluenzaVaccinationDeclinationFullForm();
                newInfluenzaVaccinationDeclinationFullForm.signature_id = savedSignatureForm.id;
                newInfluenzaVaccinationDeclinationFullForm.user_id = signed_by;
                await influenzaVaccinationDeclinationFullFormRepository.save(newInfluenzaVaccinationDeclinationFullForm);
            }
        }
        return res.customSuccess(200, 'Influenza signature form successfully created.', savedSignatureForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addInfluenzaSignatureForm = addInfluenzaSignatureForm;
//# sourceMappingURL=addInfluenzaDeclinationFormSignature.js.map