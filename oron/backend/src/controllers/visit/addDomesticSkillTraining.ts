import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { DomesticSkillTraining } from 'orm/entities/VisitLog/stepTwo/domesticSkillTraining';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addDomesticSkillTraining = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const {
      assist_to_make_bed,
      assist_to_dust_furniture,
      assist_to_vacuum,
      assist_to_arrange_clothes,
      assist_to_laundry,
      assist_to_do_dishes,
      assist_to_remove_trash,
      assist_to_fold_clothes,
      other,
      specify_other,
      assist_to_arrange_chairs,
      assist_to_arrange_tables,
      assist_to_turn_off_light,
      assist_to_turn_off_computer,
      assist_to_arrange_bookshelves,

      visit_full_form_id,
    } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;

    const domesticSkillTrainingRepository = getRepository(DomesticSkillTraining);
    const visitFullFormRepository = getRepository(VisitFullForm);

    const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
      return next(customError);
    }

    const domesticSkillTraining = new DomesticSkillTraining();
    domesticSkillTraining.assist_to_make_bed = assist_to_make_bed;
    domesticSkillTraining.assist_to_dust_furniture = assist_to_dust_furniture;
    domesticSkillTraining.assist_to_vacuum = assist_to_vacuum;
    domesticSkillTraining.assist_to_arrange_clothes = assist_to_arrange_clothes;
    domesticSkillTraining.assist_to_laundry = assist_to_laundry;
    domesticSkillTraining.assist_to_do_dishes = assist_to_do_dishes;
    domesticSkillTraining.assist_to_remove_trash = assist_to_remove_trash;
    domesticSkillTraining.assist_to_fold_clothes = assist_to_fold_clothes;
    domesticSkillTraining.other = other;
    domesticSkillTraining.specify_other = specify_other;
    domesticSkillTraining.assist_to_arrange_chairs = assist_to_arrange_chairs;
    domesticSkillTraining.assist_to_arrange_tables = assist_to_arrange_tables;
    domesticSkillTraining.assist_to_turn_off_light = assist_to_turn_off_light;
    domesticSkillTraining.assist_to_turn_off_computer = assist_to_turn_off_computer;
    domesticSkillTraining.assist_to_arrange_bookshelves = assist_to_arrange_bookshelves;
    domesticSkillTraining.account_id = account_id;
    domesticSkillTraining.status = Status.IN_PROGRESS;
    domesticSkillTraining.registered_by = registered_by;
    domesticSkillTraining.visit_full_form_id = visit_full_form_id;

    const savedDomesticSkillTraining = await domesticSkillTrainingRepository.save(domesticSkillTraining);

    if (savedDomesticSkillTraining) {
      await visitFullFormRepository.update(visit_full_form_id, {
        domestic_skill_training_id: savedDomesticSkillTraining.id,
      });
    }
    return res.customSuccess(200, 'Domestic Skill Training successfully added.', savedDomesticSkillTraining);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Domestic Skill Training', null, err);
    return next(customError);
  }
};
