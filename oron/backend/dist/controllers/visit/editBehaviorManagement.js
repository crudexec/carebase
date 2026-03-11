"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editBehaviorManagement = void 0;
const typeorm_1 = require("typeorm");
const behaviorManagement_1 = require("orm/entities/VisitLog/stepOne/behaviorManagement");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editBehaviorManagement = async (req, res, next) => {
    try {
        const account_id = req.user.account_id;
        const behaviorManagementRepository = (0, typeorm_1.getRepository)(behaviorManagement_1.BehaviorManagement);
        const behaviorManagement = new behaviorManagement_1.BehaviorManagement();
        let { behavior_type, behavior_description, what_time_did_behavior_occur, antecedent, consequence, setting, how_many_times_did_behavior_occur, for_how_long_did_behavior_occur, severity, other_crisis_intervention, other_specific_description, behavior_management_id, } = req.body;
        if (!behavior_management_id) {
            const newBehaviorManagement = new behaviorManagement_1.BehaviorManagement();
            newBehaviorManagement.behavior_type = behavior_type;
            newBehaviorManagement.behavior_description = behavior_description;
            newBehaviorManagement.what_time_did_behavior_occur = what_time_did_behavior_occur;
            newBehaviorManagement.antecedent = antecedent;
            newBehaviorManagement.consequence = consequence;
            newBehaviorManagement.setting = setting;
            newBehaviorManagement.how_many_times_did_behavior_occur = how_many_times_did_behavior_occur;
            newBehaviorManagement.for_how_long_did_behavior_occur = for_how_long_did_behavior_occur;
            newBehaviorManagement.severity = severity;
            newBehaviorManagement.other_crisis_intervention = other_crisis_intervention;
            newBehaviorManagement.other_specific_description = other_specific_description;
            newBehaviorManagement.account_id = account_id;
            await behaviorManagementRepository.save(newBehaviorManagement);
            return res.customSuccess(200, 'Behavior Management successfully created.', newBehaviorManagement);
        }
        const alreadyExistingBehaviorManagement = await behaviorManagementRepository.findOne({
            where: { id: behavior_management_id, deleted_at: null },
        });
        if (!alreadyExistingBehaviorManagement) {
            const customError = new CustomError_1.CustomError(404, 'General', `Behavior Management not found`, [
                'Behavior Management not found.',
            ]);
            return next(customError);
        }
        behavior_type = behavior_type ?? alreadyExistingBehaviorManagement.behavior_type;
        behavior_description = behavior_description ?? alreadyExistingBehaviorManagement.behavior_description;
        what_time_did_behavior_occur =
            what_time_did_behavior_occur ?? alreadyExistingBehaviorManagement.what_time_did_behavior_occur;
        antecedent = antecedent ?? alreadyExistingBehaviorManagement.antecedent;
        consequence = consequence ?? alreadyExistingBehaviorManagement.consequence;
        setting = setting ?? alreadyExistingBehaviorManagement.setting;
        how_many_times_did_behavior_occur =
            how_many_times_did_behavior_occur ?? alreadyExistingBehaviorManagement.how_many_times_did_behavior_occur;
        for_how_long_did_behavior_occur =
            for_how_long_did_behavior_occur ?? alreadyExistingBehaviorManagement.for_how_long_did_behavior_occur;
        severity = severity ?? alreadyExistingBehaviorManagement.severity;
        other_crisis_intervention =
            other_crisis_intervention ?? alreadyExistingBehaviorManagement.other_crisis_intervention;
        other_specific_description =
            other_specific_description ?? alreadyExistingBehaviorManagement.other_specific_description;
        behaviorManagement.behavior_type = behavior_type;
        behaviorManagement.behavior_description = behavior_description;
        behaviorManagement.what_time_did_behavior_occur = what_time_did_behavior_occur;
        behaviorManagement.antecedent = antecedent;
        behaviorManagement.consequence = consequence;
        behaviorManagement.setting = setting;
        behaviorManagement.how_many_times_did_behavior_occur = how_many_times_did_behavior_occur;
        behaviorManagement.for_how_long_did_behavior_occur = for_how_long_did_behavior_occur;
        behaviorManagement.severity = severity;
        behaviorManagement.other_crisis_intervention = other_crisis_intervention;
        behaviorManagement.other_specific_description = other_specific_description;
        await behaviorManagementRepository.update({ id: behavior_management_id }, behaviorManagement);
        return res.customSuccess(200, 'Behavior Management successfully edited.', behaviorManagement);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating Behavior Management', null, err);
        return next(customError);
    }
};
exports.editBehaviorManagement = editBehaviorManagement;
//# sourceMappingURL=editBehaviorManagement.js.map