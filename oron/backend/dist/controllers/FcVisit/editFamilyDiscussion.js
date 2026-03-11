"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFcFamilyDiscussion = void 0;
const typeorm_1 = require("typeorm");
const FamilyDiscussion_1 = require("orm/entities/FCVisitLog/stepOne/FamilyDiscussion");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editFcFamilyDiscussion = async (req, res, next) => {
    try {
        let { accomplishments_client_family_made_void_of_family_consultation_treatment, accomplishments_client_made_void_of_family_consultation_treatment, topic_not_related_discussed_during_family_consultation, family_discussion_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const FcFamilyDiscussionRepository = (0, typeorm_1.getRepository)(FamilyDiscussion_1.FcFamilyDiscussion);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(fcVisitFullForm_1.FcVisitFullForm);
        const alreadyExistingFcFamilyDiscussion = await FcFamilyDiscussionRepository.findOne({
            where: { id: family_discussion_id, deleted_at: null },
        });
        if (!alreadyExistingFcFamilyDiscussion) {
            const customError = new CustomError_1.CustomError(404, 'General', `Family Discussion not found`, [
                'Family Discussion not found.',
            ]);
            return next(customError);
        }
        accomplishments_client_family_made_void_of_family_consultation_treatment =
            accomplishments_client_family_made_void_of_family_consultation_treatment ??
                alreadyExistingFcFamilyDiscussion.accomplishments_client_family_made_void_of_family_consultation_treatment;
        accomplishments_client_made_void_of_family_consultation_treatment =
            accomplishments_client_made_void_of_family_consultation_treatment ??
                alreadyExistingFcFamilyDiscussion.accomplishments_client_made_void_of_family_consultation_treatment;
        topic_not_related_discussed_during_family_consultation =
            topic_not_related_discussed_during_family_consultation ??
                alreadyExistingFcFamilyDiscussion.topic_not_related_discussed_during_family_consultation;
        const FamilyDiscussion = new FamilyDiscussion_1.FcFamilyDiscussion();
        FamilyDiscussion.accomplishments_client_family_made_void_of_family_consultation_treatment =
            accomplishments_client_family_made_void_of_family_consultation_treatment;
        FamilyDiscussion.accomplishments_client_made_void_of_family_consultation_treatment =
            accomplishments_client_made_void_of_family_consultation_treatment;
        FamilyDiscussion.topic_not_related_discussed_during_family_consultation =
            topic_not_related_discussed_during_family_consultation;
        FamilyDiscussion.registered_by = registered_by;
        await FcFamilyDiscussionRepository.update(family_discussion_id, FamilyDiscussion);
        return res.customSuccess(200, 'Family Discussion successfully updated.', FamilyDiscussion);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Family Discussion', null, err);
        return next(customError);
    }
};
exports.editFcFamilyDiscussion = editFcFamilyDiscussion;
//# sourceMappingURL=editFamilyDiscussion.js.map