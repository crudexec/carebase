"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFcOtherTraining = void 0;
const typeorm_1 = require("typeorm");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const otherTraining_1 = require("orm/entities/FCVisitLog/stepThree/otherTraining");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addFcOtherTraining = async (req, res, next) => {
    try {
        const { training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication, training_and_consultation_provided_on_communication_strategies, training_and_consultation_provided_on_behavior_intervention_strategies, training_and_consultation_provided_on_safety_at_home_and_in_the_community, any_other_training_and_consultation_topics, visit_full_form_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const FcOtherTrainingRepository = (0, typeorm_1.getRepository)(otherTraining_1.FcOtherTraining);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(fcVisitFullForm_1.FcVisitFullForm);
        const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
            return next(customError);
        }
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
        OtherTraining.visit_full_form_id = visit_full_form_id;
        const savedFcOtherTraining = await FcOtherTrainingRepository.save(OtherTraining);
        if (savedFcOtherTraining) {
            await visitFullFormRepository.update(visit_full_form_id, { other_training_id: savedFcOtherTraining.id });
        }
        return res.customSuccess(200, 'Other Training successfully added.', savedFcOtherTraining);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Family Discussion', null, err);
        return next(customError);
    }
};
exports.addFcOtherTraining = addFcOtherTraining;
//# sourceMappingURL=addFcOtherTraining.js.map