import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { SensoryNeedAndMotorDevelopment } from 'orm/entities/VisitLog/stepTwo/sensoryNeedAndMotorDevelopment';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addSensoryNeedsAndMotorDevelopment = async (
  req: RequestWithJwtPayload,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      paste_objects,
      copy_simple_shapes,
      turn_pages_of_book,
      button_a_shirt,
      use_of_cutlery,
      cut_simple_shapes,
      use_pencil_and_crayons_well,
      zip_a_zipper,
      handle_scissors_well,
      play_musical_instruments,
      match_simple_objects,
      complete_simple_puzzles,
      build_with_blocks,
      other_error_motor_development_skills,
      other_error_specify_motor_development_skills,
      throw_a_ball,
      kick_using_balls,
      roll_balls_with_hand_or_foot,
      skip_in_circles,
      hang_clothes,
      go_down_slides,
      climb_ladders,
      walk_a_straight_line,
      jump_rope,
      run_around_objects,
      toss_a_ball,
      walk_backwards,
      balance_on_one_foot,
      going_up_and_down_steps,
      pump_legs_on_the_swing_at_a_playground,
      other_gross_motor_skills,
      other_specify_gross_motor_skills,
      visit_full_form_id,
    } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;

    const sensoryNeedsAndMotorDevelopmentRepository = getRepository(SensoryNeedAndMotorDevelopment);

    const visitFullFormRepository = getRepository(VisitFullForm);

    const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
      return next(customError);
    }

    const sensoryNeedsAndMotorDevelopment = new SensoryNeedAndMotorDevelopment();

    sensoryNeedsAndMotorDevelopment.paste_objects = paste_objects;
    sensoryNeedsAndMotorDevelopment.copy_simple_shapes = copy_simple_shapes;
    sensoryNeedsAndMotorDevelopment.turn_pages_of_book = turn_pages_of_book;
    sensoryNeedsAndMotorDevelopment.button_a_shirt = button_a_shirt;
    sensoryNeedsAndMotorDevelopment.use_of_cutlery = use_of_cutlery;
    sensoryNeedsAndMotorDevelopment.cut_simple_shapes = cut_simple_shapes;
    sensoryNeedsAndMotorDevelopment.use_pencil_and_crayons_well = use_pencil_and_crayons_well;
    sensoryNeedsAndMotorDevelopment.zip_a_zipper = zip_a_zipper;
    sensoryNeedsAndMotorDevelopment.handle_scissors_well = handle_scissors_well;
    sensoryNeedsAndMotorDevelopment.play_musical_instruments = play_musical_instruments;
    sensoryNeedsAndMotorDevelopment.match_simple_objects = match_simple_objects;
    sensoryNeedsAndMotorDevelopment.complete_simple_puzzles = complete_simple_puzzles;
    sensoryNeedsAndMotorDevelopment.build_with_blocks = build_with_blocks;
    sensoryNeedsAndMotorDevelopment.other_error_motor_development_skills = other_error_motor_development_skills;
    sensoryNeedsAndMotorDevelopment.other_error_specify_motor_development_skills =
      other_error_specify_motor_development_skills;
    sensoryNeedsAndMotorDevelopment.throw_a_ball = throw_a_ball;
    sensoryNeedsAndMotorDevelopment.kick_using_balls = kick_using_balls;
    sensoryNeedsAndMotorDevelopment.roll_balls_with_hand_or_foot = roll_balls_with_hand_or_foot;
    sensoryNeedsAndMotorDevelopment.skip_in_circles = skip_in_circles;
    sensoryNeedsAndMotorDevelopment.hang_clothes = hang_clothes;
    sensoryNeedsAndMotorDevelopment.go_down_slides = go_down_slides;
    sensoryNeedsAndMotorDevelopment.climb_ladders = climb_ladders;
    sensoryNeedsAndMotorDevelopment.walk_a_straight_line = walk_a_straight_line;
    sensoryNeedsAndMotorDevelopment.jump_rope = jump_rope;
    sensoryNeedsAndMotorDevelopment.run_around_objects = run_around_objects;
    sensoryNeedsAndMotorDevelopment.toss_a_ball = toss_a_ball;
    sensoryNeedsAndMotorDevelopment.walk_backwards = walk_backwards;
    sensoryNeedsAndMotorDevelopment.balance_on_one_foot = balance_on_one_foot;
    sensoryNeedsAndMotorDevelopment.going_up_and_down_steps = going_up_and_down_steps;
    sensoryNeedsAndMotorDevelopment.pump_legs_on_the_swing_at_a_playground = pump_legs_on_the_swing_at_a_playground;
    sensoryNeedsAndMotorDevelopment.other_gross_motor_skills = other_gross_motor_skills;
    sensoryNeedsAndMotorDevelopment.other_specify_gross_motor_skills = other_specify_gross_motor_skills;
    sensoryNeedsAndMotorDevelopment.account_id = account_id;
    sensoryNeedsAndMotorDevelopment.status = Status.IN_PROGRESS;
    sensoryNeedsAndMotorDevelopment.registered_by = registered_by;
    sensoryNeedsAndMotorDevelopment.visit_full_form_id = visit_full_form_id;

    const savedSensoryNeedsAndMotorDevelopment = await sensoryNeedsAndMotorDevelopmentRepository.save(
      sensoryNeedsAndMotorDevelopment,
    );

    if (savedSensoryNeedsAndMotorDevelopment) {
      await visitFullFormRepository.update(visit_full_form_id, {
        sensory_need_and_motor_development_id: savedSensoryNeedsAndMotorDevelopment.id,
      });
    }

    return res.customSuccess(
      200,
      'Sensory Needs and Motor Development successfully added.',
      savedSensoryNeedsAndMotorDevelopment,
    );
  } catch (err) {
    const customError = new CustomError(
      400,
      'Raw',
      'Network Error Adding Sensory Needs and Motor Development',
      null,
      err,
    );
    return next(customError);
  }
};
