"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSocialization = void 0;
const typeorm_1 = require("typeorm");
const socialization_1 = require("orm/entities/VisitLog/stepTwo/socialization");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addSocialization = async (req, res, next) => {
    try {
        const { birthday_party, communication_session, social_group, music_dance_group, other_social_setting, specify_other_social_setting, play_at_the_park, basketball, watch_movie, bowling, swimming, other_recreation, specify_other_recreation, visit_to_the_library, visit_to_the_museum, visit_to_the_zoo, visit_to_the_shopping_mall, visit_to_the_post_office, other_community_integration, specify_other_community_integration, visit_full_form_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const socializationRepository = (0, typeorm_1.getRepository)(socialization_1.Socialization);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
            return next(customError);
        }
        const socialization = new socialization_1.Socialization();
        socialization.birthday_party = birthday_party;
        socialization.communication_session = communication_session;
        socialization.social_group = social_group;
        socialization.music_dance_group = music_dance_group;
        socialization.other_social_setting = other_social_setting;
        socialization.specify_other_social_setting = specify_other_social_setting;
        socialization.play_at_the_park = play_at_the_park;
        socialization.basketball = basketball;
        socialization.watch_movie = watch_movie;
        socialization.bowling = bowling;
        socialization.swimming = swimming;
        socialization.other_recreation = other_recreation;
        socialization.specify_other_recreation = specify_other_recreation;
        socialization.visit_to_the_library = visit_to_the_library;
        socialization.visit_to_the_museum = visit_to_the_museum;
        socialization.visit_to_the_zoo = visit_to_the_zoo;
        socialization.visit_to_the_shopping_mall = visit_to_the_shopping_mall;
        socialization.visit_to_the_post_office = visit_to_the_post_office;
        socialization.other_community_integration = other_community_integration;
        socialization.specify_other_community_integration = specify_other_community_integration;
        socialization.account_id = account_id;
        socialization.status = genericEnums_1.Status.IN_PROGRESS;
        socialization.registered_by = registered_by;
        socialization.visit_full_form_id = visit_full_form_id;
        const savedSocialization = await socializationRepository.save(socialization);
        if (savedSocialization) {
            await visitFullFormRepository.update(visit_full_form_id, {
                socialization_id: savedSocialization.id,
            });
        }
        return res.customSuccess(200, 'Socialization successfully added.', savedSocialization);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Socialization', null, err);
        return next(customError);
    }
};
exports.addSocialization = addSocialization;
//# sourceMappingURL=addSocialization.js.map