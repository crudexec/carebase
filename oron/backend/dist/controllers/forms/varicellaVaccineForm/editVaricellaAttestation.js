"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editVaricellaAttestationForm = void 0;
const typeorm_1 = require("typeorm");
const varicellaAttestation_1 = require("orm/entities/VaricellaVaccineForm/varicellaAttestation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editVaricellaAttestationForm = async (req, res, next) => {
    let { had_chicken_pox, will_not_contract_chicken_pox, chicken_pox_not_serious_disease, side_effects_from_chicken_pox_vaccine, will_stay_home_if_infected, other, } = req.body;
    const user_id = req.user.id;
    const VaricellaAttestationFormRepository = (0, typeorm_1.getRepository)(varicellaAttestation_1.VaricellaAttestationForm);
    try {
        const newVaricellaAttestationForm = new varicellaAttestation_1.VaricellaAttestationForm();
        const varicellaAttestationForm = await VaricellaAttestationFormRepository.findOne({ where: { user_id } });
        if (varicellaAttestationForm) {
            other = other ?? varicellaAttestationForm.other;
            newVaricellaAttestationForm.had_chicken_pox = had_chicken_pox;
            newVaricellaAttestationForm.will_not_contract_chicken_pox = will_not_contract_chicken_pox;
            newVaricellaAttestationForm.chicken_pox_not_serious_disease = chicken_pox_not_serious_disease;
            newVaricellaAttestationForm.side_effects_from_chicken_pox_vaccine = side_effects_from_chicken_pox_vaccine;
            newVaricellaAttestationForm.will_stay_home_if_infected = will_stay_home_if_infected;
            newVaricellaAttestationForm.other = other;
            await VaricellaAttestationFormRepository.update(varicellaAttestationForm.id, newVaricellaAttestationForm);
            return res.customSuccess(200, 'Varicella Attestation form successfully updated.', newVaricellaAttestationForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Varicella Attestation form does not exist', [
                `Varicella Attestation form does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editVaricellaAttestationForm = editVaricellaAttestationForm;
//# sourceMappingURL=editVaricellaAttestation.js.map