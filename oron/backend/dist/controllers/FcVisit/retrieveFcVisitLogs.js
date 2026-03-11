"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveFcVisitLog = void 0;
const typeorm_1 = require("typeorm");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const VisitGoal_1 = require("orm/entities/FCVisitLog/stepTwo/VisitGoal");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveFcVisitLog = async (req, res, next) => {
    try {
        const visit_full_id = req.params.visit_full_id;
        const visitFullFormRepository = await (0, typeorm_1.getRepository)(fcVisitFullForm_1.FcVisitFullForm);
        const visitGoalRepository = await (0, typeorm_1.getRepository)(VisitGoal_1.FcVisitGoal);
        const visitGoalsArray = [];
        const visitFullForm = await visitFullFormRepository.findOne({
            where: { id: visit_full_id },
            relations: ['sessionHighlights', 'treatmentPlanSignature', 'familyDiscussion', 'otherTraining'],
        });
        const { visit_goal_ids } = visitFullForm;
        if (Array.isArray(visit_goal_ids) && visit_goal_ids.length > 0) {
            for (const goal of visit_goal_ids) {
                const visitGoal = await visitGoalRepository.findOne({
                    where: { id: goal },
                });
                visitGoalsArray.push(visitGoal);
            }
        }
        if (!visitFullForm) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit Form not found`, ['Visit Form not found.']);
            return next(customError);
        }
        visitFullForm['visitGoals'] = visitGoalsArray;
        return res.customSuccess(200, 'FC Visit Form successfully retrieved.', visitFullForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error retrieving FC visit logs', null, err);
        return next(customError);
    }
};
exports.retrieveFcVisitLog = retrieveFcVisitLog;
//# sourceMappingURL=retrieveFcVisitLogs.js.map