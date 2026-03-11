import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PersonalWorkReading } from 'orm/entities/VisitLog/stepTwo/personalWorkReading';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editPersonalWorkReading = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let {
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
      personal_work_reading_id,
    } = req.body;

    const personalWorkReadingRepository = getRepository(PersonalWorkReading);

    const formExists = await personalWorkReadingRepository.findOne({
      where: { id: personal_work_reading_id, deleted_at: null },
    });

    if (!formExists) {
      const customError = new CustomError(404, 'General', `Personal Work Reading not found`, [
        'Personal Work Reading not found.',
      ]);
      return next(customError);
    }

    grammar = grammar ?? formExists.grammar;
    writing_skills = writing_skills ?? formExists.writing_skills;
    vocabulary = vocabulary ?? formExists.vocabulary;
    reading_comprehension = reading_comprehension ?? formExists.reading_comprehension;
    algebra = algebra ?? formExists.algebra;
    geometry = geometry ?? formExists.geometry;
    measurement = measurement ?? formExists.measurement;
    number_operations = number_operations ?? formExists.number_operations;
    other = other ?? formExists.other;
    other_specify = other_specify ?? formExists.other_specify;
    i_read_a_book_to_client = i_read_a_book_to_client ?? formExists.i_read_a_book_to_client;

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

    await personalWorkReadingRepository.update(personal_work_reading_id, personalWorkReading);

    return res.customSuccess(200, 'Personal Work Reading successfully updated.', personalWorkReading);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Personal Work Reading', null, err);
    return next(customError);
  }
};
