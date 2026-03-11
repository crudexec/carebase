"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFluAttestationForm = void 0;
const typeorm_1 = require("typeorm");
const fluFullForm_1 = require("orm/entities/FluForm/fluFullForm");
const vaccineAttestationForm_1 = require("orm/entities/FluForm/vaccineAttestationForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editFluAttestationForm = async (req, res, next) => {
    const user_id = req.user.id;
    const fluAttestationFormRepository = (0, typeorm_1.getRepository)(vaccineAttestationForm_1.FluAttestationForm);
    const fluFullFormRepository = (0, typeorm_1.getRepository)(fluFullForm_1.FluFullForm);
    let { have_received_flu_vaccine, date_received_flu_vaccine, vaccination_site, received_flu_vaccine_elsewhere, medical_contraindication_to_receiving_vaccine, personal_or_religious_beliefs_preventing_vaccination, allergic_to_vaccine_components, concerns_about_vaccine_safety, other, declined_flu_vaccine, } = req.body;
    try {
        const vaccineAttestationForm = await fluAttestationFormRepository.findOne({ user_id });
        if (vaccineAttestationForm) {
            date_received_flu_vaccine = date_received_flu_vaccine ?? vaccineAttestationForm.date_received_flu_vaccine;
            vaccination_site = vaccination_site ?? vaccineAttestationForm.vaccination_site;
            other = other ?? vaccineAttestationForm.other;
            const newVaccineAttestationForm = new vaccineAttestationForm_1.FluAttestationForm();
            newVaccineAttestationForm.have_received_flu_vaccine = have_received_flu_vaccine;
            newVaccineAttestationForm.date_received_flu_vaccine = date_received_flu_vaccine;
            newVaccineAttestationForm.vaccination_site = vaccination_site;
            newVaccineAttestationForm.received_flu_vaccine_elsewhere = received_flu_vaccine_elsewhere;
            newVaccineAttestationForm.medical_contraindication_to_receiving_vaccine =
                medical_contraindication_to_receiving_vaccine;
            newVaccineAttestationForm.personal_or_religious_beliefs_preventing_vaccination =
                personal_or_religious_beliefs_preventing_vaccination;
            newVaccineAttestationForm.allergic_to_vaccine_components = allergic_to_vaccine_components;
            newVaccineAttestationForm.concerns_about_vaccine_safety = concerns_about_vaccine_safety;
            newVaccineAttestationForm.other = other;
            newVaccineAttestationForm.declined_flu_vaccine = declined_flu_vaccine;
            await fluAttestationFormRepository.update(vaccineAttestationForm.id, newVaccineAttestationForm);
            await fluFullFormRepository.update({ attestation_id: vaccineAttestationForm.id }, { status: genericEnums_1.Status.IN_PROGRESS });
            return res.customSuccess(200, 'Flu attestation form successfully updated.', newVaccineAttestationForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Flu attestation form does not exist', [
                `Flu attestation form does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editFluAttestationForm = editFluAttestationForm;
//# sourceMappingURL=editFluAttestationForm.js.map