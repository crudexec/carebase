import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VaricellaAttestationForm } from 'orm/entities/VaricellaVaccineForm/varicellaAttestation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editVaricellaAttestationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let {
    had_chicken_pox,
    will_not_contract_chicken_pox,
    chicken_pox_not_serious_disease,
    side_effects_from_chicken_pox_vaccine,
    will_stay_home_if_infected,
    other,
  } = req.body;
  const user_id = req.user.id;
  const VaricellaAttestationFormRepository = getRepository(VaricellaAttestationForm);

  try {
    const newVaricellaAttestationForm = new VaricellaAttestationForm();

    const varicellaAttestationForm = await VaricellaAttestationFormRepository.findOne({ where: { user_id } });

    if (varicellaAttestationForm) {
      other = other ?? varicellaAttestationForm.other;
      newVaricellaAttestationForm.had_chicken_pox = had_chicken_pox;
      newVaricellaAttestationForm.will_not_contract_chicken_pox = will_not_contract_chicken_pox;
      newVaricellaAttestationForm.chicken_pox_not_serious_disease = chicken_pox_not_serious_disease;
      newVaricellaAttestationForm.side_effects_from_chicken_pox_vaccine = side_effects_from_chicken_pox_vaccine;
      newVaricellaAttestationForm.will_stay_home_if_infected = will_stay_home_if_infected;
      newVaricellaAttestationForm.other = other;

      await VaricellaAttestationFormRepository.update(varicellaAttestationForm.id, newVaricellaAttestationForm);
      return res.customSuccess(200, 'Varicella Attestation form successfully updated.', newVaricellaAttestationForm);
    } else {
      const customError = new CustomError(400, 'General', 'Varicella Attestation form does not exist', [
        `Varicella Attestation form does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
