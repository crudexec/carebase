import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { TuberculosisMantouxForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisTestingForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editTbRiskAssessmentForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let {
    had_tb_infection,
    had_positive_tb_skin_test,
    had_tb_infection_date,
    had_positive_tb_skin_test_date,
    have_you_been_immunized_with_bcg_vaccine,
    immunization_description,
    vaccine_past_two_weeks,
    steriod_injection_past_two_weeks,
    exposure_to_tb_past_two_weeks,
    coughing_blood,
    profuse_night_sweats,
    loss_of_appetite,
    unexplained_weight_loss,
    chill_or_fever,
    persistent_cough_last_two_weeks,
    chest_pain,
    last_chest_xray_date,
    spent_time_with_tb_patient_in_the_last_two_years,
    were_you_born_in_a_country_where_tb_is_common,
    country_of_birth,
    traveled_to_a_country_where_tb_is_common,
    country_of_travel,
    members_of_family_traveled_to_US_from_another_country,
    family_country_of_travel,
  } = req.body;
  const owner = req.user.id;
  const tuberculosisMantouxFormRepository = getRepository(TuberculosisMantouxForm);

  try {
    const newTuberculosisMantouxForm = new TuberculosisMantouxForm();

    const tuberculosisMantouxForm = await tuberculosisMantouxFormRepository.findOne({ where: { owner } });

    if (tuberculosisMantouxForm) {
      had_tb_infection_date = had_tb_infection_date ?? tuberculosisMantouxForm.had_tb_infection_date;
      had_positive_tb_skin_test_date =
        had_positive_tb_skin_test_date ?? tuberculosisMantouxForm.had_positive_tb_skin_test_date;
      last_chest_xray_date = last_chest_xray_date ?? tuberculosisMantouxForm.last_chest_xray_date;
      spent_time_with_tb_patient_in_the_last_two_years =
        spent_time_with_tb_patient_in_the_last_two_years ??
        tuberculosisMantouxForm.spent_time_with_tb_patient_in_the_last_two_years;
      were_you_born_in_a_country_where_tb_is_common =
        were_you_born_in_a_country_where_tb_is_common ??
        tuberculosisMantouxForm.were_you_born_in_a_country_where_tb_is_common;
      country_of_birth = country_of_birth ?? tuberculosisMantouxForm.country_of_birth;
      traveled_to_a_country_where_tb_is_common =
        traveled_to_a_country_where_tb_is_common ?? tuberculosisMantouxForm.traveled_to_a_country_where_tb_is_common;
      country_of_travel = country_of_travel ?? tuberculosisMantouxForm.country_of_travel;
      members_of_family_traveled_to_US_from_another_country =
        members_of_family_traveled_to_US_from_another_country ??
        tuberculosisMantouxForm.members_of_family_traveled_to_US_from_another_country;
      family_country_of_travel = family_country_of_travel ?? tuberculosisMantouxForm.family_country_of_travel;

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

      await tuberculosisMantouxFormRepository.update(tuberculosisMantouxForm.id, newTuberculosisMantouxForm);

      return res.customSuccess(200, 'Tuberculosis Mantoux form successfully created.', newTuberculosisMantouxForm);
    } else {
      const customError = new CustomError(400, 'General', 'Tuberculosis Mantoux form does not exist', [
        `Tuberculosis Mantoux form does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
