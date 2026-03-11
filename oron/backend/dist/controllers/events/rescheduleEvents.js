"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rescheduleEventSchedule = void 0;
const typeorm_1 = require("typeorm");
const events_1 = require("orm/entities/Events/events");
const rescheduledEventLogs_1 = require("orm/entities/Events/rescheduledEventLogs");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const User_1 = require("orm/entities/User");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const rescheduleEventSchedule = async (req, res, next) => {
    try {
        const eventRepository = (0, typeorm_1.getRepository)(events_1.Events);
        const rescheduledEventLogRepository = (0, typeorm_1.getRepository)(rescheduledEventLogs_1.RescheduledEventLog);
        const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const user_id = req.user.id;
        const account_id = req.user.account_id;
        const { event_schedule_id, new_rescheduled_event_date, start_time, end_time, reason_for_rescheduling } = req.body;
        const rescheduledEventLog = new rescheduledEventLogs_1.RescheduledEventLog();
        const eventExists = await eventRepository.findOne({ where: { id: event_schedule_id, deleted_at: null } });
        if (!eventExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Event not found`, ['Event not found.']);
            return next(customError);
        }
        const intakeData = await intakeFullFormRepository.findOne({
            where: { id: eventExists.client_intake_id, deleted_at: null },
        });
        const adminData = await userRepository.findOne({ where: { id: eventExists.scheduled_by, deleted_at: null } });
        rescheduledEventLog.account_id = account_id;
        rescheduledEventLog.rescheduled_by = user_id;
        rescheduledEventLog.new_rescheduled_event_date = new_rescheduled_event_date;
        rescheduledEventLog.reason_for_rescheduling = reason_for_rescheduling;
        rescheduledEventLog.former_event_id = eventExists.id;
        rescheduledEventLog.start_time = start_time;
        rescheduledEventLog.end_time = end_time;
        await eventRepository.update({ id: eventExists.id }, {
            was_rescheduled: true,
        });
        const formerDate = eventExists.start_time;
        await rescheduledEventLogRepository.save(rescheduledEventLog);
        const formerDateFormat = new Date(eventExists.event_date).toDateString();
        const newDateFormat = new Date(new_rescheduled_event_date).toDateString();
        const clientName = intakeData.first_name + ' ' + intakeData.last_name;
        await (0, emailService_1.sendRescheduleEmail)(eventExists.employee_or_staff_name, eventExists.declination_reason, clientName, `${formerDateFormat} ${formerDate}`, `${newDateFormat} ${start_time} `, adminData.email);
        return res.customSuccess(200, 'Event rescheduled successfully', eventExists);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Scheduling Event', null, err);
        return next(customError);
    }
};
exports.rescheduleEventSchedule = rescheduleEventSchedule;
//# sourceMappingURL=rescheduleEvents.js.map