import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { InfluenzaVaccinationDeclinationForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/declinationInfluenzaForm';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editInfluenzaAttestationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let {
    aware_influenza_serious_disease,
    aware_vaccine_available_to_protect,
    can_shed_virus_after_contracting,
    can_spread_influenza_without_symptoms,
    my_influenza_vaccine_immunity_changes_every_year,
    can_not_get_influenza_from_vaccine,
    consequences_of_vaccination_refusal,
    reason_for_declining_vaccine,
  } = req.body;
  const user_id = req.user.id;
  const influenzaVaccinationDeclinationFormRepository = getRepository(InfluenzaVaccinationDeclinationForm);
  try {
    const influenzaVaccinationDeclinationForm = await influenzaVaccinationDeclinationFormRepository.findOne({
      user_id,
    });
    const newInfluenzaVaccinationDeclinationForm = new InfluenzaVaccinationDeclinationForm();

    if (influenzaVaccinationDeclinationForm) {
      aware_influenza_serious_disease =
        aware_influenza_serious_disease ?? influenzaVaccinationDeclinationForm.aware_influenza_serious_disease;
      aware_vaccine_available_to_protect =
        aware_vaccine_available_to_protect ?? influenzaVaccinationDeclinationForm.aware_vaccine_available_to_protect;
      can_shed_virus_after_contracting =
        can_shed_virus_after_contracting ?? influenzaVaccinationDeclinationForm.can_shed_virus_after_contracting;
      can_spread_influenza_without_symptoms =
        can_spread_influenza_without_symptoms ??
        influenzaVaccinationDeclinationForm.can_spread_influenza_without_symptoms;
      my_influenza_vaccine_immunity_changes_every_year =
        my_influenza_vaccine_immunity_changes_every_year ??
        influenzaVaccinationDeclinationForm.my_influenza_vaccine_immunity_changes_every_year;
      can_not_get_influenza_from_vaccine =
        can_not_get_influenza_from_vaccine ?? influenzaVaccinationDeclinationForm.can_not_get_influenza_from_vaccine;
      consequences_of_vaccination_refusal =
        consequences_of_vaccination_refusal ?? influenzaVaccinationDeclinationForm.consequences_of_vaccination_refusal;
      reason_for_declining_vaccine =
        reason_for_declining_vaccine ?? influenzaVaccinationDeclinationForm.reason_for_declining_vaccine;

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

      await influenzaVaccinationDeclinationFormRepository.update(
        influenzaVaccinationDeclinationForm.id,
        newInfluenzaVaccinationDeclinationForm,
      );

      return res.customSuccess(
        200,
        'Influenza attestation form successfully updated.',
        newInfluenzaVaccinationDeclinationForm,
      );
    } else {
      const customError = new CustomError(400, 'General', 'Influenza attestation form does not exist', [
        `Influenza attestation form does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
