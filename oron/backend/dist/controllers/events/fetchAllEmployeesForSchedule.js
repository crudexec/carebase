"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllEmployeesForSchedule = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const types_1 = require("../../orm/entities/types");
const fetchAllEmployeesForSchedule = async (req, res, next) => {
    try {
        const account_id = req.user.account_id;
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const users = await userRepository.find({ where: { account_id, role: types_1.Role.STANDARD, deleted_at: null } });
        return res.customSuccess(200, 'Employees Retrieved Successfully', users);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Retrieving Employees', null, err);
        return next(customError);
    }
};
exports.fetchAllEmployeesForSchedule = fetchAllEmployeesForSchedule;
//# sourceMappingURL=fetchAllEmployeesForSchedule.js.map