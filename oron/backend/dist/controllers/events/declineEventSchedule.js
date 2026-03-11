"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineEventSchedule = void 0;
const typeorm_1 = require("typeorm");
const events_1 = require("orm/entities/Events/events");
const rescheduledEventLogs_1 = require("orm/entities/Events/rescheduledEventLogs");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const User_1 = require("orm/entities/User");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const declineEventSchedule = async (req, res, next) => {
    try {
        const eventRepository = (0, typeorm_1.getRepository)(events_1.Events);
        const rescheduledEventLogRepository = (0, typeorm_1.getRepository)(rescheduledEventLogs_1.RescheduledEventLog);
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const { declination_reason, event_schedule_id } = req.body;
        const event = new events_1.Events();
        const eventExists = await eventRepository.findOne({ where: { id: event_schedule_id, deleted_at: null } });
        if (!eventExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Event not found`, ['Event not found.']);
            return next(customError);
        }
        eventExists.declination_date = new Date();
        eventExists.declination_reason = declination_reason;
        const userData = await userRepository.findOne({
            where: { id: eventExists.employee_or_staff_id, deleted_at: null },
        });
        const intakeData = await intakeFullFormRepository.findOne({
            where: { id: eventExists.client_intake_id, deleted_at: null },
        });
        const formerDateFormat = `${new Date(eventExists.event_date).toDateString() + ' ' + eventExists.start_time}`;
        const clientName = intakeData.first_name + ' ' + intakeData.last_name;
        await eventRepository.update({ id: event_schedule_id }, eventExists);
        await rescheduledEventLogRepository.softDelete({ former_event_id: event_schedule_id });
        await (0, emailService_1.sendRescheduleEventDeclination)(eventExists.employee_or_staff_name, clientName, formerDateFormat, declination_reason, userData.email);
        return res.customSuccess(200, 'Event rescheduled successfully declined', event);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Scheduling Event', null, err);
        return next(customError);
    }
};
exports.declineEventSchedule = declineEventSchedule;
//# sourceMappingURL=declineEventSchedule.js.map