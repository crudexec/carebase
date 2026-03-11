import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { FcOtherTraining } from 'orm/entities/FCVisitLog/stepThree/otherTraining';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editFcOtherTraining = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let {
      training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication,
      training_and_consultation_provided_on_communication_strategies,
      training_and_consultation_provided_on_behavior_intervention_strategies,
      training_and_consultation_provided_on_safety_at_home_and_in_the_community,
      any_other_training_and_consultation_topics,
      fc_other_training_id,
    } = req.body;

    const account_id = req.user.account_id;
    const registered_by = req.user.id;
    const FcOtherTrainingRepository = getRepository(FcOtherTraining);

    const alreadyExistingFcOtherTraining = await FcOtherTrainingRepository.findOne({
      where: { id: fc_other_training_id, deleted_at: null },
    });

    if (!alreadyExistingFcOtherTraining) {
      const customError = new CustomError(404, 'General', `Other Training not found`, ['Other Training not found.']);
      return next(customError);
    }

    training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication =
      training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication ??
      alreadyExistingFcOtherTraining.training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication;
    training_and_consultation_provided_on_communication_strategies =
      training_and_consultation_provided_on_communication_strategies ??
      alreadyExistingFcOtherTraining.training_and_consultation_provided_on_communication_strategies;
    training_and_consultation_provided_on_behavior_intervention_strategies =
      training_and_consultation_provided_on_behavior_intervention_strategies ??
      alreadyExistingFcOtherTraining.training_and_consultation_provided_on_behavior_intervention_strategies;

    training_and_consultation_provided_on_safety_at_home_and_in_the_community =
      training_and_consultation_provided_on_safety_at_home_and_in_the_community ??
      alreadyExistingFcOtherTraining.training_and_consultation_provided_on_safety_at_home_and_in_the_community;
    any_other_training_and_consultation_topics =
      any_other_training_and_consultation_topics ??
      alreadyExistingFcOtherTraining.any_other_training_and_consultation_topics;

    const OtherTraining = new FcOtherTraining();

    OtherTraining.training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication =
      training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication;
    OtherTraining.training_and_consultation_provided_on_communication_strategies =
      training_and_consultation_provided_on_communication_strategies;
    OtherTraining.training_and_consultation_provided_on_behavior_intervention_strategies =
      training_and_consultation_provided_on_behavior_intervention_strategies;
    OtherTraining.training_and_consultation_provided_on_safety_at_home_and_in_the_community =
      training_and_consultation_provided_on_safety_at_home_and_in_the_community;
    OtherTraining.any_other_training_and_consultation_topics = any_other_training_and_consultation_topics;
    OtherTraining.registered_by = registered_by;

    await FcOtherTrainingRepository.update(fc_other_training_id, OtherTraining);

    return res.customSuccess(200, 'Other Training successfully updated.', OtherTraining);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Family Other Training', null, err);
    return next(customError);
  }
};
