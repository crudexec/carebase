"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addInfluenzaAttestationForm = void 0;
const typeorm_1 = require("typeorm");
const declinationInfluenzaForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/declinationInfluenzaForm");
const influenzaDeclinationFullForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addInfluenzaAttestationForm = async (req, res, next) => {
    const { aware_influenza_serious_disease, aware_vaccine_available_to_protect, can_shed_virus_after_contracting, can_spread_influenza_without_symptoms, my_influenza_vaccine_immunity_changes_every_year, can_not_get_influenza_from_vaccine, consequences_of_vaccination_refusal, reason_for_declining_vaccine, } = req.body;
    const user_id = req.user.id;
    const influenzaVaccinationDeclinationFormRepository = (0, typeorm_1.getRepository)(declinationInfluenzaForm_1.InfluenzaVaccinationDeclinationForm);
    const influenzaVaccinationDeclinationFullFormRepository = (0, typeorm_1.getRepository)(influenzaDeclinationFullForm_1.InfluenzaVaccinationDeclinationFullForm);
    try {
        const influenzaVaccinationDeclinationForm = await influenzaVaccinationDeclinationFormRepository.findOne({
            user_id,
        });
        const newInfluenzaVaccinationDeclinationForm = new declinationInfluenzaForm_1.InfluenzaVaccinationDeclinationForm();
        if (influenzaVaccinationDeclinationForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Influenza declination form already exists', [
                `Influenza declination form already exists`,
            ]);
            return next(customError);
        }
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
        newInfluenzaVaccinationDeclinationForm.user_id = user_id;
        const savedInfluenzaDeclinationForm = await influenzaVaccinationDeclinationFormRepository.save(newInfluenzaVaccinationDeclinationForm);
        if (savedInfluenzaDeclinationForm) {
            const influenzaVaccinationDeclinationFullForm = await influenzaVaccinationDeclinationFullFormRepository.findOne({
                user_id,
            });
            if (influenzaVaccinationDeclinationFullForm) {
                influenzaVaccinationDeclinationFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await influenzaVaccinationDeclinationFullFormRepository.update(influenzaVaccinationDeclinationFullForm.id, {
                    declination_id: savedInfluenzaDeclinationForm.id,
                });
            }
            else {
                const newInfluenzaVaccinationDeclinationFullForm = new influenzaDeclinationFullForm_1.InfluenzaVaccinationDeclinationFullForm();
                newInfluenzaVaccinationDeclinationFullForm.user_id = user_id;
                newInfluenzaVaccinationDeclinationFullForm.declination_id = savedInfluenzaDeclinationForm.id;
                newInfluenzaVaccinationDeclinationFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await influenzaVaccinationDeclinationFullFormRepository.save(newInfluenzaVaccinationDeclinationFullForm);
            }
            return res.customSuccess(200, 'Influenza declination form successfully added.', savedInfluenzaDeclinationForm);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addInfluenzaAttestationForm = addInfluenzaAttestationForm;
//# sourceMappingURL=addInfluenzaDeclinationForm.js.map