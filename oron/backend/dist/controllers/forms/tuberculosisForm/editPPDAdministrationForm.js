"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPPDAdministrationForm = void 0;
const typeorm_1 = require("typeorm");
const ppdAdministrationForm_1 = require("orm/entities/Tuberculosis-MantouxForm/ppdAdministrationForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editPPDAdministrationForm = async (req, res, next) => {
    let { had_tb_infection, had_positive_tb_skin_test, had_tb_infection_date, had_positive_tb_skin_test_date, have_you_been_immunized_with_bcg_vaccine, immunization_description, vaccine_past_two_weeks, steriod_injection_past_two_weeks, steriods_past_four_weeks, exposure_to_tb_after_last_tb_test, } = req.body;
    const user_id = req.user.id;
    const ppdAdministrationFormRepository = (0, typeorm_1.getRepository)(ppdAdministrationForm_1.PpdAdministrationForm);
    try {
        const newPpdAdministrationForm = new ppdAdministrationForm_1.PpdAdministrationForm();
        const ppdAdministrationForm = await ppdAdministrationFormRepository.findOne({ where: { user_id } });
        if (ppdAdministrationForm) {
            had_tb_infection_date = had_tb_infection_date ?? ppdAdministrationForm.had_tb_infection_date;
            had_positive_tb_skin_test_date =
                had_positive_tb_skin_test_date ?? ppdAdministrationForm.had_positive_tb_skin_test_date;
            newPpdAdministrationForm.had_tb_infection = had_tb_infection;
            newPpdAdministrationForm.had_positive_tb_skin_test = had_positive_tb_skin_test;
            newPpdAdministrationForm.had_tb_infection_date = had_tb_infection_date;
            newPpdAdministrationForm.had_positive_tb_skin_test_date = had_positive_tb_skin_test_date;
            newPpdAdministrationForm.have_you_been_immunized_with_bcg_vaccine = have_you_been_immunized_with_bcg_vaccine;
            newPpdAdministrationForm.immunization_description = immunization_description;
            newPpdAdministrationForm.vaccine_past_two_weeks = vaccine_past_two_weeks;
            newPpdAdministrationForm.steriod_injection_past_two_weeks = steriod_injection_past_two_weeks;
            newPpdAdministrationForm.steriods_past_four_weeks = steriods_past_four_weeks;
            newPpdAdministrationForm.exposure_to_tb_after_last_tb_test = exposure_to_tb_after_last_tb_test;
            newPpdAdministrationForm.user_id = user_id;
            await ppdAdministrationFormRepository.update(ppdAdministrationForm.id, newPpdAdministrationForm);
            return res.customSuccess(200, 'PPD Administration form successfully updated.', newPpdAdministrationForm);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editPPDAdministrationForm = editPPDAdministrationForm;
//# sourceMappingURL=editPPDAdministrationForm.js.map