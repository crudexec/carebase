"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFcFamilyDiscussion = void 0;
const typeorm_1 = require("typeorm");
const FamilyDiscussion_1 = require("orm/entities/FCVisitLog/stepOne/FamilyDiscussion");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addFcFamilyDiscussion = async (req, res, next) => {
    try {
        const { accomplishments_client_family_made_void_of_family_consultation_treatment, accomplishments_client_made_void_of_family_consultation_treatment, topic_not_related_discussed_during_family_consultation, visit_full_form_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const FcFamilyDiscussionRepository = (0, typeorm_1.getRepository)(FamilyDiscussion_1.FcFamilyDiscussion);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(fcVisitFullForm_1.FcVisitFullForm);
        const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
            return next(customError);
        }
        const FamilyDiscussion = new FamilyDiscussion_1.FcFamilyDiscussion();
        FamilyDiscussion.accomplishments_client_family_made_void_of_family_consultation_treatment =
            accomplishments_client_family_made_void_of_family_consultation_treatment;
        FamilyDiscussion.accomplishments_client_made_void_of_family_consultation_treatment =
            accomplishments_client_made_void_of_family_consultation_treatment;
        FamilyDiscussion.topic_not_related_discussed_during_family_consultation =
            topic_not_related_discussed_during_family_consultation;
        FamilyDiscussion.registered_by = registered_by;
        FamilyDiscussion.visit_full_form_id = visit_full_form_id;
        console.log(FamilyDiscussion, 'FamilyDiscussion');
        const savedFcFamilyDiscussion = await FcFamilyDiscussionRepository.save(FamilyDiscussion);
        if (savedFcFamilyDiscussion) {
            await visitFullFormRepository.update(visit_full_form_id, { family_discussion_id: savedFcFamilyDiscussion.id });
        }
        return res.customSuccess(200, 'Family Discussion Added Successfully', savedFcFamilyDiscussion);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Family Discussion', null, err);
        return next(customError);
    }
};
exports.addFcFamilyDiscussion = addFcFamilyDiscussion;
//# sourceMappingURL=addFamilyDiscussion.js.map