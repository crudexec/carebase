import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { VaricellaAttestationForm } from 'orm/entities/VaricellaVaccineForm/varicellaAttestation';
import { VaricellaFullForm } from 'orm/entities/VaricellaVaccineForm/varicellaFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';
interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fillVaricellaAttestationForm = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const {
    had_chicken_pox,
    will_not_contract_chicken_pox,
    chicken_pox_not_serious_disease,
    side_effects_from_chicken_pox_vaccine,
    will_stay_home_if_infected,
    other,
  } = req.body;
  const user_id = req.user.id;
  const VaricellaAttestationFormRepository = getRepository(VaricellaAttestationForm);
  const VaricellaFullFormRepository = getRepository(VaricellaFullForm);

  try {
    const newVaricellaAttestationForm = new VaricellaAttestationForm();

    const varicellaAttestationForm = await VaricellaAttestationFormRepository.findOne({ where: { user_id } });

    if (varicellaAttestationForm) {
      const customError = new CustomError(400, 'General', 'Varicella Attestation form already exists', [
        `Varicella Attestation form already exists`,
      ]);
      return next(customError);
    }
    newVaricellaAttestationForm.had_chicken_pox = had_chicken_pox;
    newVaricellaAttestationForm.will_not_contract_chicken_pox = will_not_contract_chicken_pox;
    newVaricellaAttestationForm.chicken_pox_not_serious_disease = chicken_pox_not_serious_disease;
    newVaricellaAttestationForm.side_effects_from_chicken_pox_vaccine = side_effects_from_chicken_pox_vaccine;
    newVaricellaAttestationForm.will_stay_home_if_infected = will_stay_home_if_infected;
    newVaricellaAttestationForm.other = other;
    newVaricellaAttestationForm.user_id = user_id;

    const savedVaricellaAttestationForm = await VaricellaAttestationFormRepository.save(newVaricellaAttestationForm);

    if (savedVaricellaAttestationForm) {
      const varicellaFullForm = await VaricellaFullFormRepository.findOne({ where: { user_id } });
      if (varicellaFullForm) {
        varicellaFullForm.attestation_id = savedVaricellaAttestationForm.id;
        varicellaFullForm.status = Status.IN_PROGRESS;
        await VaricellaFullFormRepository.save(varicellaFullForm);
      } else {
        const newVaricellaFullForm = new VaricellaFullForm();
        newVaricellaFullForm.user_id = user_id;
        newVaricellaFullForm.attestation_id = savedVaricellaAttestationForm.id;
        newVaricellaFullForm.status = Status.IN_PROGRESS;
        await VaricellaFullFormRepository.save(newVaricellaFullForm);
      }
    }
    return res.customSuccess(200, 'Varicella Attestation form successfully created.', savedVaricellaAttestationForm);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
