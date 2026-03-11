"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMMRAttestationForm = void 0;
const typeorm_1 = require("typeorm");
const mmrAttestationForm_1 = require("orm/entities/MMRVaccineForm/mmrAttestationForm");
const mmrFullForm_1 = require("orm/entities/MMRVaccineForm/mmrFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addMMRAttestationForm = async (req, res, next) => {
    const { do_not_think_will_contract_mumps, do_not_think_serious_disease, side_effects_from_vaccine, will_stay_home_if_infected, other, } = req.body;
    const mmrAttestationFormRepository = (0, typeorm_1.getRepository)(mmrAttestationForm_1.MMRAttestationForm);
    const mmrFullFormRepository = (0, typeorm_1.getRepository)(mmrFullForm_1.MMRFullForm);
    const user_id = req.user.id;
    try {
        const attestationForm = await mmrAttestationFormRepository.findOne({ where: { user_id } });
        if (attestationForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Attestation form already exists', [
                `Attestation form already exists`,
            ]);
            return next(customError);
        }
        const newAttestationForm = new mmrAttestationForm_1.MMRAttestationForm();
        newAttestationForm.do_not_think_will_contract_mumps = do_not_think_will_contract_mumps;
        newAttestationForm.do_not_think_serious_disease = do_not_think_serious_disease;
        newAttestationForm.side_effects_from_vaccine = side_effects_from_vaccine;
        newAttestationForm.will_stay_home_if_infected = will_stay_home_if_infected;
        newAttestationForm.other = other;
        newAttestationForm.user_id = user_id;
        const savedAttestationForm = await mmrAttestationFormRepository.save(newAttestationForm);
        if (savedAttestationForm) {
            const fullForm = await mmrFullFormRepository.findOne({ where: { user_id } });
            if (fullForm) {
                fullForm.attestation_id = savedAttestationForm.id;
                fullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await mmrFullFormRepository.save(fullForm);
            }
            else {
                const newFullForm = new mmrFullForm_1.MMRFullForm();
                newFullForm.user_id = user_id;
                newFullForm.attestation_id = savedAttestationForm.id;
                newFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await mmrFullFormRepository.save(newFullForm);
            }
        }
        return res.customSuccess(200, 'Attestation form successfully created.', savedAttestationForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addMMRAttestationForm = addMMRAttestationForm;
//# sourceMappingURL=addMMRAttestation.js.map