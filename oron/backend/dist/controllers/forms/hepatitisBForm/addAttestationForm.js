"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHepatitisAttestation = void 0;
const typeorm_1 = require("typeorm");
const attestationForm_1 = require("orm/entities/HepatitisBForm/attestationForm");
const HepatitisFullForm_1 = require("orm/entities/HepatitisBForm/HepatitisFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addHepatitisAttestation = async (req, res, next) => {
    const { had_hepatitis_b_vaccine_series_of_three, arranged_for_hepatitis_b_vaccine_series_of_three, declined_hepatitis_b_vaccine_series_of_three, } = req.body;
    const HepatitisBAttestationFormRepository = (0, typeorm_1.getRepository)(attestationForm_1.HepatitisBAttestationForm);
    const HepatitisBFullFormRepository = (0, typeorm_1.getRepository)(HepatitisFullForm_1.HepatitisBFullForm);
    const user_id = req.user.id;
    try {
        const attestationForm = await HepatitisBAttestationFormRepository.findOne({ where: { user_id } });
        if (attestationForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Attestation form already exists', [
                `Attestation form already exists`,
            ]);
            return next(customError);
        }
        const newAttestationForm = new attestationForm_1.HepatitisBAttestationForm();
        newAttestationForm.had_hepatitis_b_vaccine_series_of_three = had_hepatitis_b_vaccine_series_of_three;
        newAttestationForm.arranged_for_hepatitis_b_vaccine_series_of_three =
            arranged_for_hepatitis_b_vaccine_series_of_three;
        newAttestationForm.declined_hepatitis_b_vaccine_series_of_three = declined_hepatitis_b_vaccine_series_of_three;
        newAttestationForm.user_id = user_id;
        const savedAttestationForm = await HepatitisBAttestationFormRepository.save(newAttestationForm);
        if (savedAttestationForm) {
            const fullForm = await HepatitisBFullFormRepository.findOne({ where: { user_id } });
            if (fullForm) {
                fullForm.attestation_id = savedAttestationForm.id;
                fullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await HepatitisBFullFormRepository.save(fullForm);
            }
            else {
                const newFullForm = new HepatitisFullForm_1.HepatitisBFullForm();
                newFullForm.user_id = user_id;
                newFullForm.attestation_id = savedAttestationForm.id;
                newFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await HepatitisBFullFormRepository.save(newFullForm);
            }
        }
        return res.customSuccess(200, 'Attestation form successfully created.', savedAttestationForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addHepatitisAttestation = addHepatitisAttestation;
//# sourceMappingURL=addAttestationForm.js.map