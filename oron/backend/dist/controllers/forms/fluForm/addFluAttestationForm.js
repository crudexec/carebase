"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFluAttestationForm = void 0;
const typeorm_1 = require("typeorm");
const fluFullForm_1 = require("orm/entities/FluForm/fluFullForm");
const vaccineAttestationForm_1 = require("orm/entities/FluForm/vaccineAttestationForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addFluAttestationForm = async (req, res, next) => {
    const user_id = req.user.id;
    const fluAttestationFormRepository = (0, typeorm_1.getRepository)(vaccineAttestationForm_1.FluAttestationForm);
    const fluFullFormRepository = (0, typeorm_1.getRepository)(fluFullForm_1.FluFullForm);
    const { have_received_flu_vaccine, date_received_flu_vaccine, vaccination_site, received_flu_vaccine_elsewhere, medical_contraindication_to_receiving_vaccine, personal_or_religious_beliefs_preventing_vaccination, allergic_to_vaccine_components, concerns_about_vaccine_safety, other, declined_flu_vaccine, } = req.body;
    try {
        const vaccineAttestationForm = await fluAttestationFormRepository.findOne({ where: { user_id } });
        if (vaccineAttestationForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Flu attestation form already exists', [
                `Flu attestation form already exists`,
            ]);
            return next(customError);
        }
        const newVaccineAttestationForm = new vaccineAttestationForm_1.FluAttestationForm();
        newVaccineAttestationForm.have_received_flu_vaccine = have_received_flu_vaccine;
        newVaccineAttestationForm.date_received_flu_vaccine = new Date(date_received_flu_vaccine);
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
        newVaccineAttestationForm.user_id = user_id;
        const savedVaccineAttestationForm = await fluAttestationFormRepository.save(newVaccineAttestationForm);
        if (savedVaccineAttestationForm) {
            const fluFullForm = await fluFullFormRepository.findOne({ where: { user_id } });
            if (fluFullForm) {
                fluFullForm.attestation_id = savedVaccineAttestationForm.id;
                fluFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await fluFullFormRepository.update(fluFullForm.id, fluFullForm);
            }
            else {
                const newFluFullForm = new fluFullForm_1.FluFullForm();
                newFluFullForm.attestation_id = savedVaccineAttestationForm.id;
                newFluFullForm.user_id = user_id;
                newFluFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await fluFullFormRepository.save(newFluFullForm);
            }
        }
        return res.customSuccess(200, 'Flu attestation form successfully created.', savedVaccineAttestationForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addFluAttestationForm = addFluAttestationForm;
//# sourceMappingURL=addFluAttestationForm.js.map