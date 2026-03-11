"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFcOtherTraining = void 0;
const typeorm_1 = require("typeorm");
const otherTraining_1 = require("orm/entities/FCVisitLog/stepThree/otherTraining");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editFcOtherTraining = async (req, res, next) => {
    try {
        let { training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication, training_and_consultation_provided_on_communication_strategies, training_and_consultation_provided_on_behavior_intervention_strategies, training_and_consultation_provided_on_safety_at_home_and_in_the_community, any_other_training_and_consultation_topics, fc_other_training_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const FcOtherTrainingRepository = (0, typeorm_1.getRepository)(otherTraining_1.FcOtherTraining);
        const alreadyExistingFcOtherTraining = await FcOtherTrainingRepository.findOne({
            where: { id: fc_other_training_id, deleted_at: null },
        });
        if (!alreadyExistingFcOtherTraining) {
            const customError = new CustomError_1.CustomError(404, 'General', `Other Training not found`, ['Other Training not found.']);
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
        const OtherTraining = new otherTraining_1.FcOtherTraining();
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
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Family Other Training', null, err);
        return next(customError);
    }
};
exports.editFcOtherTraining = editFcOtherTraining;
//# sourceMappingURL=editFcOtherTraining.js.map