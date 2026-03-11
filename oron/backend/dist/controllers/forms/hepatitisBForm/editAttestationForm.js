"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editHepatitisAttestation = void 0;
const typeorm_1 = require("typeorm");
const attestationForm_1 = require("orm/entities/HepatitisBForm/attestationForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editHepatitisAttestation = async (req, res, next) => {
    const { had_hepatitis_b_vaccine_series_of_three, arranged_for_hepatitis_b_vaccine_series_of_three, declined_hepatitis_b_vaccine_series_of_three, } = req.body;
    const HepatitisBAttestationFormRepository = (0, typeorm_1.getRepository)(attestationForm_1.HepatitisBAttestationForm);
    const user_id = req.user.id;
    try {
        const attestationForm = await HepatitisBAttestationFormRepository.findOne({ where: { user_id } });
        if (attestationForm) {
            const newAttestationForm = new attestationForm_1.HepatitisBAttestationForm();
            newAttestationForm.had_hepatitis_b_vaccine_series_of_three = had_hepatitis_b_vaccine_series_of_three;
            newAttestationForm.arranged_for_hepatitis_b_vaccine_series_of_three =
                arranged_for_hepatitis_b_vaccine_series_of_three;
            newAttestationForm.declined_hepatitis_b_vaccine_series_of_three = declined_hepatitis_b_vaccine_series_of_three;
            await HepatitisBAttestationFormRepository.update(attestationForm.id, newAttestationForm);
            return res.customSuccess(200, 'Emergency contact information successfully created.', newAttestationForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Attestation form does not exist', [
                `Attestation form does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editHepatitisAttestation = editHepatitisAttestation;
//# sourceMappingURL=editAttestationForm.js.map