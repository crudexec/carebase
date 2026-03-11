"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFcSessionHighlights = void 0;
const typeorm_1 = require("typeorm");
const SessionHighlights_1 = require("orm/entities/FCVisitLog/stepOne/SessionHighlights");
const fcVisitFullForm_1 = require("orm/entities/FCVisitLog/fcVisitFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addFcSessionHighlights = async (req, res, next) => {
    try {
        const { session_ocurred_in, those_present_for_the_family_consultant_session, visit_full_form_id } = req.body;
        const registered_by = req.user.id;
        const FcsessionHighlightsRepository = (0, typeorm_1.getRepository)(SessionHighlights_1.FcSessionHighlights);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(fcVisitFullForm_1.FcVisitFullForm);
        function isValidUUID(uuid) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(uuid);
        }
        if (!isValidUUID(visit_full_form_id)) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Invalid Visit ID', ['Invalid Visit ID.']);
            return next(customError);
        }
        if (!visit_full_form_id) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Visit ID is required', ['Visit ID is required.']);
            return next(customError);
        }
        const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
            return next(customError);
        }
        const FcsessionHighlights = new SessionHighlights_1.FcSessionHighlights();
        FcsessionHighlights.session_ocurred_in = session_ocurred_in;
        FcsessionHighlights.those_present_for_the_family_consultant_session =
            those_present_for_the_family_consultant_session;
        FcsessionHighlights.registered_by = registered_by;
        FcsessionHighlights.visit_full_form_id = visit_full_form_id;
        const savedFcSessionHighlights = await FcsessionHighlightsRepository.save(FcsessionHighlights);
        if (savedFcSessionHighlights) {
            await visitFullFormRepository.update(visit_full_form_id, { session_highlights_id: savedFcSessionHighlights.id });
        }
        return res.customSuccess(200, 'Session Highlights successfully added.', savedFcSessionHighlights);
    }
    catch (err) {
        console.log('Error Adding Session Highlights', err);
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Session Highlights', null, err);
        return next(customError);
    }
};
exports.addFcSessionHighlights = addFcSessionHighlights;
//# sourceMappingURL=addSessionHighlights.js.map