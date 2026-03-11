import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { InfluenzaVaccinationDeclinationForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/declinationInfluenzaForm';
import { InfluenzaVaccinationDeclinationFullForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addInfluenzaAttestationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const {
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
  const influenzaVaccinationDeclinationFullFormRepository = getRepository(InfluenzaVaccinationDeclinationFullForm);
  try {
    const influenzaVaccinationDeclinationForm = await influenzaVaccinationDeclinationFormRepository.findOne({
      user_id,
    });
    const newInfluenzaVaccinationDeclinationForm = new InfluenzaVaccinationDeclinationForm();

    if (influenzaVaccinationDeclinationForm) {
      const customError = new CustomError(400, 'General', 'Influenza declination form already exists', [
        `Influenza declination form already exists`,
      ]);
      return next(customError);
    }
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
    newInfluenzaVaccinationDeclinationForm.user_id = user_id;

    const savedInfluenzaDeclinationForm = await influenzaVaccinationDeclinationFormRepository.save(
      newInfluenzaVaccinationDeclinationForm,
    );

    if (savedInfluenzaDeclinationForm) {
      const influenzaVaccinationDeclinationFullForm = await influenzaVaccinationDeclinationFullFormRepository.findOne({
        user_id,
      });
      if (influenzaVaccinationDeclinationFullForm) {
        influenzaVaccinationDeclinationFullForm.status = Status.IN_PROGRESS;
        await influenzaVaccinationDeclinationFullFormRepository.update(influenzaVaccinationDeclinationFullForm.id, {
          declination_id: savedInfluenzaDeclinationForm.id,
        });
      } else {
        const newInfluenzaVaccinationDeclinationFullForm = new InfluenzaVaccinationDeclinationFullForm();
        newInfluenzaVaccinationDeclinationFullForm.user_id = user_id;
        newInfluenzaVaccinationDeclinationFullForm.declination_id = savedInfluenzaDeclinationForm.id;
        newInfluenzaVaccinationDeclinationFullForm.status = Status.IN_PROGRESS;
        await influenzaVaccinationDeclinationFullFormRepository.save(newInfluenzaVaccinationDeclinationFullForm);
      }

      return res.customSuccess(200, 'Influenza declination form successfully added.', savedInfluenzaDeclinationForm);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
