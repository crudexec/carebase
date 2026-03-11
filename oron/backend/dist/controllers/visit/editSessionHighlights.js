"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editSessionHighlights = void 0;
const typeorm_1 = require("typeorm");
const sessionHighlights_1 = require("orm/entities/VisitLog/stepOne/sessionHighlights");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editSessionHighlights = async (req, res, next) => {
    try {
        let { location, level_of_compliance, injury_to_self, aggression_to_others, client_hospitalized_in_care_today, client_placed_themselves_in_harm_by_leaving_my_care, session_highlights_id, } = req.body;
        const sessionHighlightsRepository = (0, typeorm_1.getRepository)(sessionHighlights_1.SessionHighlights);
        const alreadyExistingSessionHighlights = await sessionHighlightsRepository.findOne({
            where: { id: session_highlights_id, deleted_at: null },
        });
        if (!alreadyExistingSessionHighlights) {
            const customError = new CustomError_1.CustomError(404, 'General', `Session Highlights not found`, [
                'Session Highlights not found.',
            ]);
            return next(customError);
        }
        location = location ?? alreadyExistingSessionHighlights.location;
        level_of_compliance = level_of_compliance ?? alreadyExistingSessionHighlights.level_of_compliance;
        injury_to_self = injury_to_self ?? alreadyExistingSessionHighlights.injury_to_self;
        aggression_to_others = aggression_to_others ?? alreadyExistingSessionHighlights.aggression_to_others;
        client_hospitalized_in_care_today =
            client_hospitalized_in_care_today ?? alreadyExistingSessionHighlights.client_hospitalized_in_care_today;
        client_placed_themselves_in_harm_by_leaving_my_care =
            client_placed_themselves_in_harm_by_leaving_my_care ??
                alreadyExistingSessionHighlights.client_placed_themselves_in_harm_by_leaving_my_care;
        const sessionHighlights = new sessionHighlights_1.SessionHighlights();
        sessionHighlights.location = location;
        sessionHighlights.level_of_compliance = level_of_compliance;
        sessionHighlights.injury_to_self = injury_to_self;
        sessionHighlights.aggression_to_others = aggression_to_others;
        sessionHighlights.client_hospitalized_in_care_today = client_hospitalized_in_care_today;
        sessionHighlights.client_placed_themselves_in_harm_by_leaving_my_care =
            client_placed_themselves_in_harm_by_leaving_my_care;
        await sessionHighlightsRepository.update(session_highlights_id, sessionHighlights);
        return res.customSuccess(200, 'Session Highlights successfully updated.', sessionHighlights);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating Session Highlights', null, err);
        return next(customError);
    }
};
exports.editSessionHighlights = editSessionHighlights;
//# sourceMappingURL=editSessionHighlights.js.map