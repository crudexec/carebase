"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventSchedule = void 0;
const typeorm_1 = require("typeorm");
const events_1 = require("orm/entities/Events/events");
const rescheduledEventLogs_1 = require("orm/entities/Events/rescheduledEventLogs");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const deleteEventSchedule = async (req, res, next) => {
    try {
        const eventRepository = (0, typeorm_1.getRepository)(events_1.Events);
        const rescheduledEventLogRepository = (0, typeorm_1.getRepository)(rescheduledEventLogs_1.RescheduledEventLog);
        const { event_schedule_id } = req.body;
        const eventExists = await eventRepository.findOne({ where: { id: event_schedule_id, deleted_at: null } });
        if (!eventExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Event not found`, ['Event not found.']);
            return next(customError);
        }
        await eventRepository.softDelete(event_schedule_id);
        await rescheduledEventLogRepository.softDelete({ former_event_id: event_schedule_id });
        return res.customSuccess(200, 'Event schedule successfully deleted', null);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Deleting Event', null, err);
        return next(customError);
    }
};
exports.deleteEventSchedule = deleteEventSchedule;
//# sourceMappingURL=deleteEvents.js.map