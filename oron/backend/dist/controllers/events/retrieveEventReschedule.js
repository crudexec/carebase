"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveEventsReSchedule = void 0;
const typeorm_1 = require("typeorm");
const rescheduledEventLogs_1 = require("orm/entities/Events/rescheduledEventLogs");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveEventsReSchedule = async (req, res, next) => {
    try {
        const account_id = req.user.account_id;
        const rescheduledEventLogRepository = (0, typeorm_1.getRepository)(rescheduledEventLogs_1.RescheduledEventLog);
        const rescheduledEvents = await rescheduledEventLogRepository.find({
            where: { account_id, deleted_at: null },
            relations: ['events'],
        });
        return res.customSuccess(200, 'Events Retrieved Successfully', rescheduledEvents);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Retrieving Event', null, err);
        return next(customError);
    }
};
exports.retrieveEventsReSchedule = retrieveEventsReSchedule;
//# sourceMappingURL=retrieveEventReschedule.js.map