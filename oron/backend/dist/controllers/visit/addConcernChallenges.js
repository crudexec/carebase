"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addConcernAndChallenges = void 0;
const typeorm_1 = require("typeorm");
const concernAndChallenges_1 = require("orm/entities/VisitLog/stepOne/concernAndChallenges");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addConcernAndChallenges = async (req, res, next) => {
    try {
        const { was_there_any_concerns_or_challenges, supervisor_to_contact_during_session, describe_circumstances_involved, visit_full_form_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const concernAndChallengesRepository = (0, typeorm_1.getRepository)(concernAndChallenges_1.ConcernAndChallenges);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const visitExists = await visitFullFormRepository.findOne({
            where: { id: visit_full_form_id, deleted_at: null },
        });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit Form not found`, ['Visit Form not found.']);
            return next(customError);
        }
        const concernAndChallenges = new concernAndChallenges_1.ConcernAndChallenges();
        concernAndChallenges.was_there_any_concerns_or_challenges = was_there_any_concerns_or_challenges;
        concernAndChallenges.supervisor_to_contact_during_session = supervisor_to_contact_during_session;
        concernAndChallenges.describe_circumstances_involved = describe_circumstances_involved;
        concernAndChallenges.account_id = account_id;
        concernAndChallenges.visit_full_form_id = visit_full_form_id;
        concernAndChallenges.status = genericEnums_1.Status.IN_PROGRESS;
        concernAndChallenges.registered_by = registered_by;
        const savedConcernAndChallenges = await concernAndChallengesRepository.save(concernAndChallenges);
        if (savedConcernAndChallenges) {
            await visitFullFormRepository.update(visit_full_form_id, {
                concern_and_challenges_id: savedConcernAndChallenges.id,
            });
        }
        return res.customSuccess(200, 'Concerns and Challenges successfully added.', savedConcernAndChallenges);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Concerns And Challenges', null, err);
        return next(customError);
    }
};
exports.addConcernAndChallenges = addConcernAndChallenges;
//# sourceMappingURL=addConcernChallenges.js.map