"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const list = async (req, res, next) => {
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    try {
        const users = await userRepository.find({
            select: ['id', 'first_name', 'email', 'role', 'created_at', 'updated_at'],
        });
        res.customSuccess(200, 'List of users.', users);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', `Can't retrieve list of users.`, null, err);
        return next(customError);
    }
};
exports.list = list;
//# sourceMappingURL=list.js.map