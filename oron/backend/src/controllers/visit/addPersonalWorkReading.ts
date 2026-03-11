import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PersonalWorkReading } from 'orm/entities/VisitLog/stepTwo/personalWorkReading';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addPersonalWorkReading = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const {
      grammar,
      writing_skills,
      vocabulary,
      reading_comprehension,
      algebra,
      geometry,
      measurement,
      number_operations,
      other,
      other_specify,
      i_read_a_book_to_client,
      visit_full_form_id,
    } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;

    const personalWorkReadingRepository = getRepository(PersonalWorkReading);

    const visitFullFormRepository = getRepository(VisitFullForm);

    const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
      return next(customError);
    }

    const personalWorkReading = new PersonalWorkReading();

    personalWorkReading.grammar = grammar;
    personalWorkReading.writing_skills = writing_skills;
    personalWorkReading.vocabulary = vocabulary;
    personalWorkReading.reading_comprehension = reading_comprehension;
    personalWorkReading.algebra = algebra;
    personalWorkReading.geometry = geometry;
    personalWorkReading.measurement = measurement;
    personalWorkReading.number_operations = number_operations;
    personalWorkReading.other = other;
    personalWorkReading.other_specify = other_specify;
    personalWorkReading.i_read_a_book_to_client = i_read_a_book_to_client;

    personalWorkReading.account_id = account_id;
    personalWorkReading.status = Status.IN_PROGRESS;
    personalWorkReading.registered_by = registered_by;
    personalWorkReading.visit_full_form_id = visit_full_form_id;

    const savedPersonalWorkReading = await personalWorkReadingRepository.save(personalWorkReading);

    if (savedPersonalWorkReading) {
      await visitFullFormRepository.update(visit_full_form_id, {
        personal_work_reading_id: savedPersonalWorkReading.id,
      });
    }

    return res.customSuccess(200, 'Personal Work Reading successfully added.', savedPersonalWorkReading);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Personal Work Reading', null, err);
    return next(customError);
  }
};
