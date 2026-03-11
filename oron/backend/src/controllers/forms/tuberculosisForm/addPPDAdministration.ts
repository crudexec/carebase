import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PpdAdministrationForm } from 'orm/entities/Tuberculosis-MantouxForm/ppdAdministrationForm';
import { TuberculosisFullForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fillPPDAdministrationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const {
    had_tb_infection,
    had_positive_tb_skin_test,
    had_tb_infection_date,
    had_positive_tb_skin_test_date,
    have_you_been_immunized_with_bcg_vaccine,
    immunization_description,
    vaccine_past_two_weeks,
    steriod_injection_past_two_weeks,
    steriods_past_four_weeks,
    exposure_to_tb_after_last_tb_test,
  } = req.body;
  const user_id = req.user.id;
  const ppdAdministrationFormRepository = getRepository(PpdAdministrationForm);
  const tuberculosisFullFormRepository = getRepository(TuberculosisFullForm);

  try {
    const newPpdAdministrationForm = new PpdAdministrationForm();

    const ppdAdministrationForm = await ppdAdministrationFormRepository.findOne({ where: { user_id } });

    if (ppdAdministrationForm) {
      const customError = new CustomError(400, 'General', 'PPD Administration form already exists', [
        `PPD Administration form already exists`,
      ]);
      return next(customError);
    }
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

    const savedPpdAdministrationForm = await ppdAdministrationFormRepository.save(newPpdAdministrationForm);

    if (savedPpdAdministrationForm) {
      const tuberculosisFullForm = await tuberculosisFullFormRepository.findOne({ where: { owner: user_id } });
      if (tuberculosisFullForm) {
        tuberculosisFullForm.ppd_administration_form_id = savedPpdAdministrationForm.id;
        tuberculosisFullForm.status = Status.IN_PROGRESS;
        await tuberculosisFullFormRepository.save(tuberculosisFullForm);
      } else {
        const newTuberculosisFullForm = new TuberculosisFullForm();
        newTuberculosisFullForm.owner = user_id;
        newTuberculosisFullForm.ppd_administration_form_id = savedPpdAdministrationForm.id;
        newTuberculosisFullForm.status = Status.IN_PROGRESS;
        await tuberculosisFullFormRepository.save(newTuberculosisFullForm);
      }
    }

    return res.customSuccess(200, 'PPD Administration form successfully created.', savedPpdAdministrationForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
