import { Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';

import { TreatmentGoal } from 'orm/entities/TreatmentPlan/treatmentGoal';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editTreatmentGoal = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  try {
    await queryRunner.startTransaction();
    const form_id = req.params.form_id;
    let {
      goal_area,
      target_skill,
      short_term_objective,
      goal_status,
      goal_setting,
      number_of_trials,
      goal_frequency,
      current_skill_level,
      target_performance_level,
      goal_background,
      goal_statement,
      implementation_procedure,
      objective_term_steps,
      evaluating_progress,
      reinforcers,
      materials,
      progress_monitoring,
      mastery_towards_goal_achievement,
      expected_outcome,
      goal_comment,
      present_level,
      target_level,
      consequences,
    } = req.body;
    const goalRepository = connection.getRepository(TreatmentGoal);

    const alreadyExistingGoal = await goalRepository.findOne({
      where: { id: form_id },
    });

    if (!alreadyExistingGoal) {
      const customError = new CustomError(404, 'General', `Goal Information not found`, [
        'Goal Information not found.',
      ]);
      return next(customError);
    }

    goal_area = goal_area ?? alreadyExistingGoal.goal_area;
    target_skill = target_skill ?? alreadyExistingGoal.target_skill;
    short_term_objective = short_term_objective ?? alreadyExistingGoal.short_term_objective;
    goal_status = goal_status ?? alreadyExistingGoal.goal_status;
    goal_setting = goal_setting ?? alreadyExistingGoal.goal_setting;
    number_of_trials = number_of_trials ?? alreadyExistingGoal.number_of_trials;
    goal_frequency = goal_frequency ?? alreadyExistingGoal.goal_frequency;
    current_skill_level = current_skill_level ?? alreadyExistingGoal.current_skill_level;
    target_performance_level = target_performance_level ?? alreadyExistingGoal.target_performance_level;
    goal_background = goal_background ?? alreadyExistingGoal.goal_background;
    goal_statement = goal_statement ?? alreadyExistingGoal.goal_statement;
    implementation_procedure = implementation_procedure ?? alreadyExistingGoal.implementation_procedure;
    objective_term_steps = objective_term_steps ?? alreadyExistingGoal.objective_term_steps;
    reinforcers = reinforcers ?? alreadyExistingGoal.reinforcers;
    materials = materials ?? alreadyExistingGoal.materials;
    progress_monitoring = progress_monitoring ?? alreadyExistingGoal.progress_monitoring;
    mastery_towards_goal_achievement =
      mastery_towards_goal_achievement ?? alreadyExistingGoal.mastery_towards_goal_achievement;
    expected_outcome = expected_outcome ?? alreadyExistingGoal.expected_outcome;
    goal_comment = goal_comment ?? alreadyExistingGoal.goal_comment;
    evaluating_progress = evaluating_progress ?? alreadyExistingGoal.evaluating_progress;
    consequences = consequences ?? alreadyExistingGoal.consequences;
    present_level = present_level ?? alreadyExistingGoal.present_level;
    target_level = target_level ?? alreadyExistingGoal.target_level;

    const newGoal = new TreatmentGoal();

    newGoal.goal_area = goal_area;
    newGoal.target_skill = target_skill;
    newGoal.short_term_objective = short_term_objective;
    newGoal.goal_status = goal_status;
    newGoal.goal_setting = goal_setting;
    newGoal.number_of_trials = number_of_trials;
    newGoal.goal_frequency = goal_frequency;
    newGoal.current_skill_level = current_skill_level;
    newGoal.target_performance_level = target_performance_level;
    newGoal.goal_background = goal_background;
    newGoal.goal_statement = goal_statement;
    newGoal.implementation_procedure = implementation_procedure;
    newGoal.objective_term_steps = objective_term_steps;
    newGoal.evaluating_progress = evaluating_progress;
    newGoal.reinforcers = reinforcers;
    newGoal.materials = materials;
    newGoal.progress_monitoring = progress_monitoring;
    newGoal.mastery_towards_goal_achievement = mastery_towards_goal_achievement;
    newGoal.expected_outcome = expected_outcome;
    newGoal.goal_comment = goal_comment;
    newGoal.present_level = present_level;
    newGoal.target_level = target_level;
    newGoal.consequences = consequences;

    await goalRepository.update(alreadyExistingGoal.id, newGoal);
    await queryRunner.commitTransaction();

    return res.status(200).json({
      message: 'Goal Information Updated Successfully',
      data: newGoal,
    });
  } catch (err) {
    await queryRunner.rollbackTransaction();
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Treatment Goal Information', null, err);
    return next(customError);
  } finally {
    await queryRunner.release();
  }
};
