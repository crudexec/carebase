"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillTbRiskAssessmentForm = void 0;
const typeorm_1 = require("typeorm");
const tuberculosisFullForm_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm");
const tuberculosisTestingForm_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisTestingForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fillTbRiskAssessmentForm = async (req, res, next) => {
    const { had_tb_infection, had_positive_tb_skin_test, had_tb_infection_date, had_positive_tb_skin_test_date, have_you_been_immunized_with_bcg_vaccine, immunization_description, vaccine_past_two_weeks, steriod_injection_past_two_weeks, exposure_to_tb_past_two_weeks, coughing_blood, profuse_night_sweats, loss_of_appetite, unexplained_weight_loss, chill_or_fever, persistent_cough_last_two_weeks, chest_pain, last_chest_xray_date, spent_time_with_tb_patient_in_the_last_two_years, were_you_born_in_a_country_where_tb_is_common, country_of_birth, traveled_to_a_country_where_tb_is_common, country_of_travel, members_of_family_traveled_to_US_from_another_country, family_country_of_travel, } = req.body;
    const owner = req.user.id;
    const tuberculosisMantouxFormRepository = (0, typeorm_1.getRepository)(tuberculosisTestingForm_1.TuberculosisMantouxForm);
    const tuberculosisFullFormRepository = (0, typeorm_1.getRepository)(tuberculosisFullForm_1.TuberculosisFullForm);
    try {
        const newTuberculosisMantouxForm = new tuberculosisTestingForm_1.TuberculosisMantouxForm();
        const tuberculosisMantouxForm = await tuberculosisMantouxFormRepository.findOne({ where: { owner } });
        if (tuberculosisMantouxForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Tuberculosis Mantoux form already exists', [
                `Tuberculosis Mantoux form already exists`,
            ]);
            return next(customError);
        }
        newTuberculosisMantouxForm.had_tb_infection = had_tb_infection;
        newTuberculosisMantouxForm.had_positive_tb_skin_test = had_positive_tb_skin_test;
        newTuberculosisMantouxForm.had_tb_infection_date = had_tb_infection_date;
        newTuberculosisMantouxForm.had_positive_tb_skin_test_date = had_positive_tb_skin_test_date;
        newTuberculosisMantouxForm.have_you_been_immunized_with_bcg_vaccine = have_you_been_immunized_with_bcg_vaccine;
        newTuberculosisMantouxForm.immunization_description = immunization_description;
        newTuberculosisMantouxForm.vaccine_past_two_weeks = vaccine_past_two_weeks;
        newTuberculosisMantouxForm.steriod_injection_past_two_weeks = steriod_injection_past_two_weeks;
        newTuberculosisMantouxForm.exposure_to_tb_past_two_weeks = exposure_to_tb_past_two_weeks;
        newTuberculosisMantouxForm.coughing_blood = coughing_blood;
        newTuberculosisMantouxForm.profuse_night_sweats = profuse_night_sweats;
        newTuberculosisMantouxForm.loss_of_appetite = loss_of_appetite;
        newTuberculosisMantouxForm.unexplained_weight_loss = unexplained_weight_loss;
        newTuberculosisMantouxForm.chill_or_fever = chill_or_fever;
        newTuberculosisMantouxForm.persistent_cough_last_two_weeks = persistent_cough_last_two_weeks;
        newTuberculosisMantouxForm.chest_pain = chest_pain;
        newTuberculosisMantouxForm.last_chest_xray_date = last_chest_xray_date;
        newTuberculosisMantouxForm.spent_time_with_tb_patient_in_the_last_two_years =
            spent_time_with_tb_patient_in_the_last_two_years;
        newTuberculosisMantouxForm.were_you_born_in_a_country_where_tb_is_common =
            were_you_born_in_a_country_where_tb_is_common;
        newTuberculosisMantouxForm.country_of_birth = country_of_birth;
        newTuberculosisMantouxForm.traveled_to_a_country_where_tb_is_common = traveled_to_a_country_where_tb_is_common;
        newTuberculosisMantouxForm.country_of_travel = country_of_travel;
        newTuberculosisMantouxForm.members_of_family_traveled_to_US_from_another_country =
            members_of_family_traveled_to_US_from_another_country;
        newTuberculosisMantouxForm.family_country_of_travel = family_country_of_travel;
        newTuberculosisMantouxForm.owner = owner;
        const savedTuberculosisMantouxForm = await tuberculosisMantouxFormRepository.save(newTuberculosisMantouxForm);
        if (savedTuberculosisMantouxForm) {
            const tuberculosisFullForm = await tuberculosisFullFormRepository.findOne({ where: { owner } });
            if (tuberculosisFullForm) {
                tuberculosisFullForm.tuberculosis_testing_form_id = savedTuberculosisMantouxForm.id;
                tuberculosisFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await tuberculosisFullFormRepository.save(tuberculosisFullForm);
            }
            else {
                const newTuberculosisFullForm = new tuberculosisFullForm_1.TuberculosisFullForm();
                newTuberculosisFullForm.owner = owner;
                newTuberculosisFullForm.tuberculosis_testing_form_id = savedTuberculosisMantouxForm.id;
                newTuberculosisFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await tuberculosisFullFormRepository.save(newTuberculosisFullForm);
            }
        }
        return res.customSuccess(200, 'Tuberculosis Mantoux form successfully created.', savedTuberculosisMantouxForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fillTbRiskAssessmentForm = fillTbRiskAssessmentForm;
//# sourceMappingURL=addRiskAssessment.js.map