"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSessionHighlights = void 0;
const typeorm_1 = require("typeorm");
const sessionHighlights_1 = require("orm/entities/VisitLog/stepOne/sessionHighlights");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addSessionHighlights = async (req, res, next) => {
    try {
        const { location, level_of_compliance, injury_to_self, aggression_to_others, client_hospitalized_in_care_today, client_placed_themselves_in_harm_by_leaving_my_care, visit_full_form_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const sessionHighlightsRepository = (0, typeorm_1.getRepository)(sessionHighlights_1.SessionHighlights);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
            return next(customError);
        }
        const sessionHighlights = new sessionHighlights_1.SessionHighlights();
        sessionHighlights.location = location;
        sessionHighlights.level_of_compliance = level_of_compliance;
        sessionHighlights.injury_to_self = injury_to_self;
        sessionHighlights.aggression_to_others = aggression_to_others;
        sessionHighlights.client_hospitalized_in_care_today = client_hospitalized_in_care_today;
        sessionHighlights.client_placed_themselves_in_harm_by_leaving_my_care =
            client_placed_themselves_in_harm_by_leaving_my_care;
        sessionHighlights.account_id = account_id;
        sessionHighlights.status = genericEnums_1.Status.IN_PROGRESS;
        sessionHighlights.registered_by = registered_by;
        sessionHighlights.visit_full_form_id = visit_full_form_id;
        const savedSessionHighlights = await sessionHighlightsRepository.save(sessionHighlights);
        if (savedSessionHighlights) {
            await visitFullFormRepository.update(visit_full_form_id, { session_highlights_id: savedSessionHighlights.id });
        }
        return res.customSuccess(200, 'Session Highlights successfully added.', savedSessionHighlights);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Session Highlights', null, err);
        return next(customError);
    }
};
exports.addSessionHighlights = addSessionHighlights;
//# sourceMappingURL=addSessionHighlights.js.map