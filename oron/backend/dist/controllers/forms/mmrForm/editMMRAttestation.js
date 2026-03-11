"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editMMRAttestationForm = void 0;
const typeorm_1 = require("typeorm");
const mmrAttestationForm_1 = require("orm/entities/MMRVaccineForm/mmrAttestationForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editMMRAttestationForm = async (req, res, next) => {
    let { do_not_think_will_contract_mumps, do_not_think_serious_disease, side_effects_from_vaccine, will_stay_home_if_infected, other, } = req.body;
    const mmrAttestationFormRepository = (0, typeorm_1.getRepository)(mmrAttestationForm_1.MMRAttestationForm);
    const user_id = req.user.id;
    try {
        const attestationForm = await mmrAttestationFormRepository.findOne({ where: { user_id } });
        if (attestationForm) {
            other = other ?? attestationForm.other;
            const newAttestationForm = new mmrAttestationForm_1.MMRAttestationForm();
            newAttestationForm.do_not_think_will_contract_mumps = do_not_think_will_contract_mumps;
            newAttestationForm.do_not_think_serious_disease = do_not_think_serious_disease;
            newAttestationForm.side_effects_from_vaccine = side_effects_from_vaccine;
            newAttestationForm.will_stay_home_if_infected = will_stay_home_if_infected;
            newAttestationForm.other = other;
            newAttestationForm.user_id = user_id;
            await mmrAttestationFormRepository.update(attestationForm.id, newAttestationForm);
            return res.customSuccess(200, 'Attestation form successfully updated.', newAttestationForm);
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
exports.editMMRAttestationForm = editMMRAttestationForm;
//# sourceMappingURL=editMMRAttestation.js.map