"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSelfManagement = void 0;
const typeorm_1 = require("typeorm");
const selfManagement_1 = require("orm/entities/VisitLog/stepOne/selfManagement");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addSelfManagement = async (req, res, next) => {
    try {
        const { responding_to_others, sharing, increasing_on_task_behavior, initiating_interactions, conversing_with_others, increasing_play_skills, promoting_daily_living_skills, taking_turns, following_the_rules, reducing_occurence_of_interfering_behavior, cooperate_with_peers_in_group_activity, other, visit_full_form_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const selfManagementRepository = (0, typeorm_1.getRepository)(selfManagement_1.SelfManagement);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
            return next(customError);
        }
        const selfManagement = new selfManagement_1.SelfManagement();
        selfManagement.responding_to_others = responding_to_others;
        selfManagement.sharing = sharing;
        selfManagement.increasing_on_task_behavior = increasing_on_task_behavior;
        selfManagement.initiating_interactions = initiating_interactions;
        selfManagement.conversing_with_others = conversing_with_others;
        selfManagement.increasing_play_skills = increasing_play_skills;
        selfManagement.promoting_daily_living_skills = promoting_daily_living_skills;
        selfManagement.taking_turns = taking_turns;
        selfManagement.following_the_rules = following_the_rules;
        selfManagement.reducing_occurence_of_interfering_behavior = reducing_occurence_of_interfering_behavior;
        selfManagement.cooperate_with_peers_in_group_activity = cooperate_with_peers_in_group_activity;
        selfManagement.other = other;
        selfManagement.account_id = account_id;
        selfManagement.status = genericEnums_1.Status.IN_PROGRESS;
        selfManagement.registered_by = registered_by;
        selfManagement.visit_full_form_id = visit_full_form_id;
        const savedSelfManagement = await selfManagementRepository.save(selfManagement);
        if (savedSelfManagement) {
            await visitFullFormRepository.update(visit_full_form_id, { self_management_id: savedSelfManagement.id });
        }
        return res.customSuccess(200, 'Self Management successfully added.', savedSelfManagement);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Self Management', null, err);
        return next(customError);
    }
};
exports.addSelfManagement = addSelfManagement;
//# sourceMappingURL=addSelfManagement.js.map