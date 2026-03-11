"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editMoreAboutClient = void 0;
const typeorm_1 = require("typeorm");
const moreAboutClient_1 = require("orm/entities/IntakeForm/moreAboutClient");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editMoreAboutClient = async (req, res, next) => {
    let { things_I_can_do_by_myself, things_I_need_help_with, new_skills_I_want_to_learn, my_hobbies, favorite_food_and_snacks, what_makes_me_mad, behaviors_I_sometimes_Display, ways_my_behaviors_can_be_managed, my_house_rules, familiar_communication_modes, can_be_transported_alone, toileting, cared_for_by, document_provided_during_intake, good_performance_reward, other_comments, } = req.body;
    try {
        const moreAboutInformationRepository = (0, typeorm_1.getRepository)(moreAboutClient_1.MoreAboutInformation);
        const form_id = req.params.form_id;
        const moreAboutInformation = await moreAboutInformationRepository.findOne({ where: { id: form_id } });
        if (!moreAboutInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'More About Information already exists', [
                `More About Information already exists`,
            ]);
            return next(customError);
        }
        things_I_can_do_by_myself = things_I_can_do_by_myself ?? moreAboutInformation.things_I_can_do_by_myself;
        things_I_need_help_with = things_I_need_help_with ?? moreAboutInformation.things_I_need_help_with;
        new_skills_I_want_to_learn = new_skills_I_want_to_learn ?? moreAboutInformation.new_skills_I_want_to_learn;
        my_hobbies = my_hobbies ?? moreAboutInformation.my_hobbies;
        favorite_food_and_snacks = favorite_food_and_snacks ?? moreAboutInformation.favorite_food_and_snacks;
        what_makes_me_mad = what_makes_me_mad ?? moreAboutInformation.what_makes_me_mad;
        behaviors_I_sometimes_Display = behaviors_I_sometimes_Display ?? moreAboutInformation.behaviors_I_sometimes_Display;
        ways_my_behaviors_can_be_managed =
            ways_my_behaviors_can_be_managed ?? moreAboutInformation.ways_my_behaviors_can_be_managed;
        my_house_rules = my_house_rules ?? moreAboutInformation.my_house_rules;
        familiar_communication_modes = familiar_communication_modes ?? moreAboutInformation.familiar_communication_modes;
        can_be_transported_alone = can_be_transported_alone ?? moreAboutInformation.can_be_transported_alone;
        toileting = toileting ?? moreAboutInformation.toileting;
        cared_for_by = cared_for_by ?? moreAboutInformation.cared_for_by;
        document_provided_during_intake =
            document_provided_during_intake ?? moreAboutInformation.document_provided_during_intake;
        good_performance_reward = good_performance_reward ?? moreAboutInformation.good_performance_reward;
        other_comments = other_comments ?? moreAboutInformation.other_comments;
        const updatedMoreAboutInformation = new moreAboutClient_1.MoreAboutInformation();
        updatedMoreAboutInformation.things_I_can_do_by_myself = things_I_can_do_by_myself;
        updatedMoreAboutInformation.things_I_need_help_with = things_I_need_help_with;
        updatedMoreAboutInformation.new_skills_I_want_to_learn = new_skills_I_want_to_learn;
        updatedMoreAboutInformation.my_hobbies = my_hobbies;
        updatedMoreAboutInformation.favorite_food_and_snacks = favorite_food_and_snacks;
        updatedMoreAboutInformation.what_makes_me_mad = what_makes_me_mad;
        updatedMoreAboutInformation.behaviors_I_sometimes_Display = behaviors_I_sometimes_Display;
        updatedMoreAboutInformation.ways_my_behaviors_can_be_managed = ways_my_behaviors_can_be_managed;
        updatedMoreAboutInformation.my_house_rules = my_house_rules;
        updatedMoreAboutInformation.familiar_communication_modes = familiar_communication_modes;
        updatedMoreAboutInformation.can_be_transported_alone = can_be_transported_alone;
        updatedMoreAboutInformation.toileting = toileting;
        updatedMoreAboutInformation.cared_for_by = cared_for_by;
        updatedMoreAboutInformation.document_provided_during_intake = document_provided_during_intake;
        updatedMoreAboutInformation.good_performance_reward = good_performance_reward;
        updatedMoreAboutInformation.other_comments = other_comments;
        await moreAboutInformationRepository.update({ id: moreAboutInformation.id }, updatedMoreAboutInformation);
        return res.customSuccess(200, 'More About Information successfully updated.', updatedMoreAboutInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating More About Client', null, err);
        return next(customError);
    }
};
exports.editMoreAboutClient = editMoreAboutClient;
//# sourceMappingURL=editMoreAboutClient.js.map