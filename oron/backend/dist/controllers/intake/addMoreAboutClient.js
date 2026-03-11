"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMoreAboutClient = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const moreAboutClient_1 = require("orm/entities/IntakeForm/moreAboutClient");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addMoreAboutClient = async (req, res, next) => {
    const { things_I_can_do_by_myself, things_I_need_help_with, new_skills_I_want_to_learn, my_hobbies, favorite_food_and_snacks, what_makes_me_mad, behaviors_I_sometimes_Display, ways_my_behaviors_can_be_managed, my_house_rules, familiar_communication_modes, can_be_transported_alone, toileting, cared_for_by, document_provided_during_intake, good_performance_reward, other_comments, service_coordinator_information_id, intake_full_id, } = req.body;
    try {
        const moreAboutInformationRepository = (0, typeorm_1.getRepository)(moreAboutClient_1.MoreAboutInformation);
        const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const user_id = req.user.id;
        const newMoreAboutInformation = new moreAboutClient_1.MoreAboutInformation();
        newMoreAboutInformation.things_I_can_do_by_myself = things_I_can_do_by_myself;
        newMoreAboutInformation.things_I_need_help_with = things_I_need_help_with;
        newMoreAboutInformation.new_skills_I_want_to_learn = new_skills_I_want_to_learn;
        newMoreAboutInformation.my_hobbies = my_hobbies;
        newMoreAboutInformation.favorite_food_and_snacks = favorite_food_and_snacks;
        newMoreAboutInformation.what_makes_me_mad = what_makes_me_mad;
        newMoreAboutInformation.behaviors_I_sometimes_Display = behaviors_I_sometimes_Display;
        newMoreAboutInformation.ways_my_behaviors_can_be_managed = ways_my_behaviors_can_be_managed;
        newMoreAboutInformation.my_house_rules = my_house_rules;
        newMoreAboutInformation.familiar_communication_modes = familiar_communication_modes;
        newMoreAboutInformation.can_be_transported_alone = can_be_transported_alone;
        newMoreAboutInformation.toileting = toileting;
        newMoreAboutInformation.cared_for_by = cared_for_by;
        newMoreAboutInformation.document_provided_during_intake = document_provided_during_intake;
        newMoreAboutInformation.good_performance_reward = good_performance_reward;
        newMoreAboutInformation.other_comments = other_comments;
        newMoreAboutInformation.registered_by = user_id;
        const savedMoreAboutInformation = await moreAboutInformationRepository.save(newMoreAboutInformation);
        if (savedMoreAboutInformation) {
            const newIntakeFullForm = new intakeFullForm_1.IntakeFullForm();
            const alreadyExistingIntakeFullForm = await intakeFullFormRepository.findOne({
                where: { id: intake_full_id, deleted_at: null },
            });
            if (alreadyExistingIntakeFullForm) {
                newIntakeFullForm.more_about_information_id = savedMoreAboutInformation.id;
                await intakeFullFormRepository.update(alreadyExistingIntakeFullForm.id, newIntakeFullForm);
            }
        }
        return res.customSuccess(200, 'More About Information successfully created.', savedMoreAboutInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding More About Client', null, err);
        return next(customError);
    }
};
exports.addMoreAboutClient = addMoreAboutClient;
//# sourceMappingURL=addMoreAboutClient.js.map