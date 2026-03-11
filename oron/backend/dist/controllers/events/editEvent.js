"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editEventSchedule = void 0;
const typeorm_1 = require("typeorm");
const events_1 = require("orm/entities/Events/events");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editEventSchedule = async (req, res, next) => {
    try {
        const eventRepository = (0, typeorm_1.getRepository)(events_1.Events);
        const { event_schedule_id, event_date, start_time, end_time, notes, client_name, employee_or_staff_name, employee_or_staff_id, should_repeat, } = req.body;
        const eventExists = await eventRepository.findOne({ where: { id: event_schedule_id, deleted_at: null } });
        if (!eventExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Event not found`, ['Event not found.']);
            return next(customError);
        }
        eventExists.event_date = event_date;
        eventExists.start_time = start_time;
        eventExists.end_time = end_time;
        eventExists.notes = notes;
        eventExists.client_name = client_name;
        eventExists.employee_or_staff_name = employee_or_staff_name;
        eventExists.employee_or_staff_id = employee_or_staff_id;
        eventExists.should_repeat = should_repeat;
        await eventRepository.update({ id: event_schedule_id }, eventExists);
        return res.customSuccess(200, 'Event successfully edited ', eventExists);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Editing scheduled event', null, err);
        return next(customError);
    }
};
exports.editEventSchedule = editEventSchedule;
//# sourceMappingURL=editEvent.js.map