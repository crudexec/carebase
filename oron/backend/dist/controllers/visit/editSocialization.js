"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editSocialization = void 0;
const typeorm_1 = require("typeorm");
const socialization_1 = require("orm/entities/VisitLog/stepTwo/socialization");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editSocialization = async (req, res, next) => {
    try {
        let { birthday_party, communication_session, social_group, music_dance_group, other_social_setting, specify_other_social_setting, play_at_the_park, basketball, watch_movie, bowling, swimming, other_recreation, specify_other_recreation, visit_to_the_library, visit_to_the_museum, visit_to_the_zoo, visit_to_the_shopping_mall, visit_to_the_post_office, other_community_integration, specify_other_community_integration, socialization_id, } = req.body;
        const socializationRepository = (0, typeorm_1.getRepository)(socialization_1.Socialization);
        const formExists = await socializationRepository.findOne({ where: { id: socialization_id, deleted_at: null } });
        if (!formExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Socialization not found`, ['Socialization not found.']);
            return next(customError);
        }
        birthday_party = birthday_party ?? formExists.birthday_party;
        communication_session = communication_session ?? formExists.communication_session;
        social_group = social_group ?? formExists.social_group;
        music_dance_group = music_dance_group ?? formExists.music_dance_group;
        other_social_setting = other_social_setting ?? formExists.other_social_setting;
        specify_other_social_setting = specify_other_social_setting ?? formExists.specify_other_social_setting;
        play_at_the_park = play_at_the_park ?? formExists.play_at_the_park;
        basketball = basketball ?? formExists.basketball;
        watch_movie = watch_movie ?? formExists.watch_movie;
        bowling = bowling ?? formExists.bowling;
        swimming = swimming ?? formExists.swimming;
        other_recreation = other_recreation ?? formExists.other_recreation;
        specify_other_recreation = specify_other_recreation ?? formExists.specify_other_recreation;
        visit_to_the_library = visit_to_the_library ?? formExists.visit_to_the_library;
        visit_to_the_museum = visit_to_the_museum ?? formExists.visit_to_the_museum;
        visit_to_the_zoo = visit_to_the_zoo ?? formExists.visit_to_the_zoo;
        visit_to_the_shopping_mall = visit_to_the_shopping_mall ?? formExists.visit_to_the_shopping_mall;
        visit_to_the_post_office = visit_to_the_post_office ?? formExists.visit_to_the_post_office;
        other_community_integration = other_community_integration ?? formExists.other_community_integration;
        specify_other_community_integration =
            specify_other_community_integration ?? formExists.specify_other_community_integration;
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
        await socializationRepository.update(socialization_id, socialization);
        return res.customSuccess(200, 'Socialization successfully updated.', socialization);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating Socialization', null, err);
        return next(customError);
    }
};
exports.editSocialization = editSocialization;
//# sourceMappingURL=editSocialization.js.map