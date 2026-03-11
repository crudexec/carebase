"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveVisitLog = void 0;
const typeorm_1 = require("typeorm");
const behaviorManagement_1 = require("orm/entities/VisitLog/stepOne/behaviorManagement");
const visitGoal_1 = require("orm/entities/VisitLog/stepThree/visitGoal");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveVisitLog = async (req, res, next) => {
    try {
        const visit_full_id = req.params.visit_full_id;
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const behaviorManagementRepository = (0, typeorm_1.getRepository)(behaviorManagement_1.BehaviorManagement);
        const visitGoalRepository = (0, typeorm_1.getRepository)(visitGoal_1.VisitGoal);
        const visitGoalsArray = [];
        const visitFullForm = await visitFullFormRepository.findOne({
            where: { id: visit_full_id },
            relations: [
                'sessionHighlights',
                'selfManagement',
                'communication',
                'concernAndChallenges',
                'domesticSkillTraining',
                'playLeisure',
                'snackMealTime',
                'utilizationOfMoney',
                'socialization',
                'safetyAndSurvivalSkills',
                'personalCareAndBladderControl',
                'sensoryNeedAndMotorDevelopment',
                'personalWorkReading',
                'transportationTypeAndObjectives',
            ],
        });
        const { visit_goal_ids } = visitFullForm;
        if (Array.isArray(visit_goal_ids) && visit_goal_ids.length > 0) {
            const visitGoals = await visitGoalRepository.find({
                where: { id: (0, typeorm_1.In)(visit_goal_ids) },
            });
            visitGoalsArray.push(...visitGoals);
        }
        if (!visitFullForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit Form not found`, ['Visit Form not found.']);
            return next(customError);
        }
        const { behavior_management_ids } = visitFullForm;
        const behaviors = [];
        if (Array.isArray(behavior_management_ids) && behavior_management_ids.length > 0) {
            const behaviorManagements = await behaviorManagementRepository.find({
                where: { id: (0, typeorm_1.In)(behavior_management_ids) },
            });
            behaviors.push(...behaviorManagements);
        }
        visitFullForm['behaviorManagement'] = behaviors;
        visitFullForm['visitGoals'] = visitGoalsArray;
        return res.customSuccess(200, 'Visit Form successfully retrieved.', visitFullForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error retrieving visit logs', null, err);
        return next(customError);
    }
};
exports.retrieveVisitLog = retrieveVisitLog;
//# sourceMappingURL=retrieveVisitLog.js.map