"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterCalendarEventsSchedule = void 0;
const typeorm_1 = require("typeorm");
const events_1 = require("orm/entities/Events/events");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const filterCalendarEventsSchedule = async (req, res, next) => {
    try {
        const account_id = req.user.account_id;
        const eventRepository = (0, typeorm_1.getRepository)(events_1.Events);
        const { employee_or_staff_name, client_name } = req.body;
        const events = await eventRepository
            .createQueryBuilder('events')
            .orderBy('created_at', 'DESC')
            .where('LOWER(events.employee_or_staff_name) LIKE LOWER(:employee_or_staff_name)', {
            employee_or_staff_name: `%${employee_or_staff_name}%`,
        })
            .andWhere('LOWER(events.client_name) LIKE LOWER(:client_name)', { client_name: `%${client_name}%` })
            .andWhere({ account_id, deleted_at: null })
            .getMany();
        return res.customSuccess(200, 'Events Retrieved Successfully', events);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Retrieving Event', null, err);
        return next(customError);
    }
};
exports.filterCalendarEventsSchedule = filterCalendarEventsSchedule;
//# sourceMappingURL=filterCalendarEvents.js.map