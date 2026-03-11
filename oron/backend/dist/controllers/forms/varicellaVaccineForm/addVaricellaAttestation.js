"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillVaricellaAttestationForm = void 0;
const typeorm_1 = require("typeorm");
const varicellaAttestation_1 = require("orm/entities/VaricellaVaccineForm/varicellaAttestation");
const varicellaFullForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fillVaricellaAttestationForm = async (req, res, next) => {
    const { had_chicken_pox, will_not_contract_chicken_pox, chicken_pox_not_serious_disease, side_effects_from_chicken_pox_vaccine, will_stay_home_if_infected, other, } = req.body;
    const user_id = req.user.id;
    const VaricellaAttestationFormRepository = (0, typeorm_1.getRepository)(varicellaAttestation_1.VaricellaAttestationForm);
    const VaricellaFullFormRepository = (0, typeorm_1.getRepository)(varicellaFullForm_1.VaricellaFullForm);
    try {
        const newVaricellaAttestationForm = new varicellaAttestation_1.VaricellaAttestationForm();
        const varicellaAttestationForm = await VaricellaAttestationFormRepository.findOne({ where: { user_id } });
        if (varicellaAttestationForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Varicella Attestation form already exists', [
                `Varicella Attestation form already exists`,
            ]);
            return next(customError);
        }
        newVaricellaAttestationForm.had_chicken_pox = had_chicken_pox;
        newVaricellaAttestationForm.will_not_contract_chicken_pox = will_not_contract_chicken_pox;
        newVaricellaAttestationForm.chicken_pox_not_serious_disease = chicken_pox_not_serious_disease;
        newVaricellaAttestationForm.side_effects_from_chicken_pox_vaccine = side_effects_from_chicken_pox_vaccine;
        newVaricellaAttestationForm.will_stay_home_if_infected = will_stay_home_if_infected;
        newVaricellaAttestationForm.other = other;
        newVaricellaAttestationForm.user_id = user_id;
        const savedVaricellaAttestationForm = await VaricellaAttestationFormRepository.save(newVaricellaAttestationForm);
        if (savedVaricellaAttestationForm) {
            const varicellaFullForm = await VaricellaFullFormRepository.findOne({ where: { user_id } });
            if (varicellaFullForm) {
                varicellaFullForm.attestation_id = savedVaricellaAttestationForm.id;
                varicellaFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await VaricellaFullFormRepository.save(varicellaFullForm);
            }
            else {
                const newVaricellaFullForm = new varicellaFullForm_1.VaricellaFullForm();
                newVaricellaFullForm.user_id = user_id;
                newVaricellaFullForm.attestation_id = savedVaricellaAttestationForm.id;
                newVaricellaFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await VaricellaFullFormRepository.save(newVaricellaFullForm);
            }
        }
        return res.customSuccess(200, 'Varicella Attestation form successfully created.', savedVaricellaAttestationForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fillVaricellaAttestationForm = fillVaricellaAttestationForm;
//# sourceMappingURL=addVaricellaAttestation.js.map