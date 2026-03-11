"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveAllEventsSchedule = void 0;
const typeorm_1 = require("typeorm");
const events_1 = require("orm/entities/Events/events");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveAllEventsSchedule = async (req, res, next) => {
    try {
        const account_id = req.user.account_id;
        const eventRepository = (0, typeorm_1.getRepository)(events_1.Events);
        const events = await eventRepository.find({ where: { account_id, deleted_at: null } });
        return res.customSuccess(200, 'Events Retrieved Successfully', events);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Retrieving Event', null, err);
        return next(customError);
    }
};
exports.retrieveAllEventsSchedule = retrieveAllEventsSchedule;
//# sourceMappingURL=retrieveAllEvents.js.map