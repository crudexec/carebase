"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editConcernAndChallenges = void 0;
const typeorm_1 = require("typeorm");
const concernAndChallenges_1 = require("orm/entities/VisitLog/stepOne/concernAndChallenges");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editConcernAndChallenges = async (req, res, next) => {
    try {
        let { was_there_any_concerns_or_challenges, supervisor_to_contact_during_session, describe_circumstances_involved, concern_and_challenges_id, } = req.body;
        const concernAndChallengesRepository = (0, typeorm_1.getRepository)(concernAndChallenges_1.ConcernAndChallenges);
        const alreadyExistingConcernAndChallenges = await concernAndChallengesRepository.findOne({
            where: { id: concern_and_challenges_id, deleted_at: null },
        });
        if (!alreadyExistingConcernAndChallenges) {
            const customError = new CustomError_1.CustomError(404, 'General', `Concerns and Challenges not found`, [
                'Concerns and Challenges not found.',
            ]);
            return next(customError);
        }
        was_there_any_concerns_or_challenges =
            was_there_any_concerns_or_challenges ?? alreadyExistingConcernAndChallenges.was_there_any_concerns_or_challenges;
        supervisor_to_contact_during_session =
            supervisor_to_contact_during_session ?? alreadyExistingConcernAndChallenges.supervisor_to_contact_during_session;
        describe_circumstances_involved =
            describe_circumstances_involved ?? alreadyExistingConcernAndChallenges.describe_circumstances_involved;
        const concernAndChallenges = new concernAndChallenges_1.ConcernAndChallenges();
        concernAndChallenges.was_there_any_concerns_or_challenges = was_there_any_concerns_or_challenges;
        concernAndChallenges.supervisor_to_contact_during_session = supervisor_to_contact_during_session;
        concernAndChallenges.describe_circumstances_involved = describe_circumstances_involved;
        await concernAndChallengesRepository.update(concern_and_challenges_id, concernAndChallenges);
        return res.customSuccess(200, 'Concerns and Challenges successfully updated.', concernAndChallenges);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating Concerns And Challenges', null, err);
        return next(customError);
    }
};
exports.editConcernAndChallenges = editConcernAndChallenges;
//# sourceMappingURL=editConcernChallenges.js.map