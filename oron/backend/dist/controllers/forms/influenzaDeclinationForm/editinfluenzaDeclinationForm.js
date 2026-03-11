"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editInfluenzaAttestationForm = void 0;
const typeorm_1 = require("typeorm");
const declinationInfluenzaForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/declinationInfluenzaForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editInfluenzaAttestationForm = async (req, res, next) => {
    let { aware_influenza_serious_disease, aware_vaccine_available_to_protect, can_shed_virus_after_contracting, can_spread_influenza_without_symptoms, my_influenza_vaccine_immunity_changes_every_year, can_not_get_influenza_from_vaccine, consequences_of_vaccination_refusal, reason_for_declining_vaccine, } = req.body;
    const user_id = req.user.id;
    const influenzaVaccinationDeclinationFormRepository = (0, typeorm_1.getRepository)(declinationInfluenzaForm_1.InfluenzaVaccinationDeclinationForm);
    try {
        const influenzaVaccinationDeclinationForm = await influenzaVaccinationDeclinationFormRepository.findOne({
            user_id,
        });
        const newInfluenzaVaccinationDeclinationForm = new declinationInfluenzaForm_1.InfluenzaVaccinationDeclinationForm();
        if (influenzaVaccinationDeclinationForm) {
            aware_influenza_serious_disease =
                aware_influenza_serious_disease ?? influenzaVaccinationDeclinationForm.aware_influenza_serious_disease;
            aware_vaccine_available_to_protect =
                aware_vaccine_available_to_protect ?? influenzaVaccinationDeclinationForm.aware_vaccine_available_to_protect;
            can_shed_virus_after_contracting =
                can_shed_virus_after_contracting ?? influenzaVaccinationDeclinationForm.can_shed_virus_after_contracting;
            can_spread_influenza_without_symptoms =
                can_spread_influenza_without_symptoms ??
                    influenzaVaccinationDeclinationForm.can_spread_influenza_without_symptoms;
            my_influenza_vaccine_immunity_changes_every_year =
                my_influenza_vaccine_immunity_changes_every_year ??
                    influenzaVaccinationDeclinationForm.my_influenza_vaccine_immunity_changes_every_year;
            can_not_get_influenza_from_vaccine =
                can_not_get_influenza_from_vaccine ?? influenzaVaccinationDeclinationForm.can_not_get_influenza_from_vaccine;
            consequences_of_vaccination_refusal =
                consequences_of_vaccination_refusal ?? influenzaVaccinationDeclinationForm.consequences_of_vaccination_refusal;
            reason_for_declining_vaccine =
                reason_for_declining_vaccine ?? influenzaVaccinationDeclinationForm.reason_for_declining_vaccine;
            newInfluenzaVaccinationDeclinationForm.aware_influenza_serious_disease = aware_influenza_serious_disease;
            newInfluenzaVaccinationDeclinationForm.aware_vaccine_available_to_protect = aware_vaccine_available_to_protect;
            newInfluenzaVaccinationDeclinationForm.can_shed_virus_after_contracting = can_shed_virus_after_contracting;
            newInfluenzaVaccinationDeclinationForm.can_spread_influenza_without_symptoms =
                can_spread_influenza_without_symptoms;
            newInfluenzaVaccinationDeclinationForm.my_influenza_vaccine_immunity_changes_every_year =
                my_influenza_vaccine_immunity_changes_every_year;
            newInfluenzaVaccinationDeclinationForm.can_not_get_influenza_from_vaccine = can_not_get_influenza_from_vaccine;
            newInfluenzaVaccinationDeclinationForm.consequences_of_vaccination_refusal = consequences_of_vaccination_refusal;
            newInfluenzaVaccinationDeclinationForm.reason_for_declining_vaccine = reason_for_declining_vaccine;
            await influenzaVaccinationDeclinationFormRepository.update(influenzaVaccinationDeclinationForm.id, newInfluenzaVaccinationDeclinationForm);
            return res.customSuccess(200, 'Influenza attestation form successfully updated.', newInfluenzaVaccinationDeclinationForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Influenza attestation form does not exist', [
                `Influenza attestation form does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editInfluenzaAttestationForm = editInfluenzaAttestationForm;
//# sourceMappingURL=editinfluenzaDeclinationForm.js.map