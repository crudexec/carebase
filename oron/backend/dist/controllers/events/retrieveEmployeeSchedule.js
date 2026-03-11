"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveEmployeeSchedule = void 0;
const typeorm_1 = require("typeorm");
const events_1 = require("orm/entities/Events/events");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveEmployeeSchedule = async (req, res, next) => {
    try {
        const account_id = req.user.account_id;
        const user_id = req.user.id;
        const eventRepository = (0, typeorm_1.getRepository)(events_1.Events);
        const events = await eventRepository.find({
            where: { employee_or_staff_id: user_id, account_id, deleted_at: null },
        });
        return res.customSuccess(200, 'Employee Events Retrieved Successfully', events);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Retrieving Event', null, err);
        return next(customError);
    }
};
exports.retrieveEmployeeSchedule = retrieveEmployeeSchedule;
//# sourceMappingURL=retrieveEmployeeSchedule.js.map