"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVisitDetails = void 0;
const typeorm_1 = require("typeorm");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const visitGoal_1 = require("orm/entities/VisitLog/stepThree/visitGoal");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth)
        return 'Unknown';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age.toString();
};
const fetchVisitDetails = async (req, res, next) => {
    const visitRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
    const visitGoalRepository = (0, typeorm_1.getRepository)(visitGoal_1.VisitGoal);
    const visit_id = req.params.id;
    try {
        const visit = await visitRepository.findOne({
            where: { id: visit_id },
            relations: [
                'intakeFullForm',
                'intakeFullForm.clientInformation',
                'user',
                'sessionHighlights',
                'communication',
                'concernAndChallenges',
                'selfManagement',
            ],
        });
        if (!visit) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Visit not found', ['Visit not found.']);
            return next(customError);
        }
        let visitGoals = [];
        if (visit.visit_goal_ids && visit.visit_goal_ids.length > 0) {
            visitGoals = await visitGoalRepository.find({
                where: { id: (0, typeorm_1.In)(visit.visit_goal_ids) },
                relations: ['treatmentFullPlan'],
            });
        }
        const goalsSummary = visitGoals.map((goal, index) => {
            let stepsCompleted = 0;
            if (Array.isArray(goal.goal_steps)) {
                stepsCompleted = goal.goal_steps.filter((step) => step.response === 'Yes' || step.response === 'yes').length;
            }
            return {
                goal_number: index + 1,
                target_skill: goal.short_term_objective || 'Not specified',
                steps_completed: stepsCompleted,
            };
        });
        const intakeForm = visit.intakeFullForm;
        const clientInfo = intakeForm?.clientInformation;
        const staffInfo = visit.user;
        let clientName = 'Unknown Client';
        if (intakeForm) {
            if (intakeForm.first_name || intakeForm.last_name) {
                clientName = `${intakeForm.first_name || ''} ${intakeForm.last_name || ''}`.trim();
            }
            else if (clientInfo) {
                clientName = `${clientInfo.first_name || ''} ${clientInfo.last_name || ''}`.trim();
            }
        }
        const visitDetails = {
            id: visit.id,
            client_id: visit.intake_full_id || '',
            client_name: clientName,
            client_age: calculateAge(clientInfo?.date_of_birth || null),
            visit_type: visit.treatment_type || 'IISS Assessment',
            submitted_date: visit.created_at ? new Date(visit.created_at).toISOString() : null,
            staff_name: staffInfo
                ? `${staffInfo.first_name || ''} ${staffInfo.last_name || ''}`.trim()
                : 'Unknown Staff',
            status: visit.status,
            goals_count: visitGoals.length,
            goals_summary: goalsSummary,
            session_highlights: visit.concernAndChallenges?.describe_circumstances_involved || null,
            location: visit.sessionHighlights?.location || null,
        };
        return res.customSuccess(200, 'Visit details fetched successfully', visitDetails);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error fetching visit details', null, err);
        return next(customError);
    }
};
exports.fetchVisitDetails = fetchVisitDetails;
//# sourceMappingURL=fetchVisitDetails.js.map