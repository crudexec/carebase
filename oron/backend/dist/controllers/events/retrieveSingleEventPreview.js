"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveSingleEventSchedule = void 0;
const typeorm_1 = require("typeorm");
const events_1 = require("orm/entities/Events/events");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveSingleEventSchedule = async (req, res, next) => {
    try {
        const event_id = req.params.id;
        const eventRepository = (0, typeorm_1.getRepository)(events_1.Events);
        const events = await eventRepository.find({ where: { id: event_id, deleted_at: null } });
        return res.customSuccess(200, 'Events Retrieved Successfully', events);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Retrieving Event', null, err);
        return next(customError);
    }
};
exports.retrieveSingleEventSchedule = retrieveSingleEventSchedule;
//# sourceMappingURL=retrieveSingleEventPreview.js.map