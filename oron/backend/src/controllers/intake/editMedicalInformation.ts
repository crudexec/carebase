import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MedicalInformation } from 'orm/entities/IntakeForm/medicalInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editMedicalInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let { diagnosis, medical_history_or_allergies, medications, other_comments } = req.body;
    const form_id = req.params.form_id;

    const medicalInformationRepository = getRepository(MedicalInformation);

    const medicalInformation = await medicalInformationRepository.findOne({ where: { id: form_id } });

    if (!medicalInformation) {
      const customError = new CustomError(400, 'General', 'Medical Information already exists', [
        `Medical Information already exists`,
      ]);
      return next(customError);
    }

    diagnosis = diagnosis ?? medicalInformation.diagnosis;
    medical_history_or_allergies = medical_history_or_allergies ?? medicalInformation.medical_history_or_allergies;
    medications = medications ?? medicalInformation.medications;
    other_comments = other_comments ?? medicalInformation.other_comments;

    const updatedMedicalInformation = new MedicalInformation();

    updatedMedicalInformation.diagnosis = diagnosis;
    updatedMedicalInformation.medical_history_or_allergies = medical_history_or_allergies;
    updatedMedicalInformation.medications = medications;
    updatedMedicalInformation.other_comments = other_comments;

    await medicalInformationRepository.update({ id: medicalInformation.id }, updatedMedicalInformation);

    return res.customSuccess(200, 'Medical Information successfully updated.', updatedMedicalInformation);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error', null, err);
    return next(customError);
  }
};
