"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.show = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const show = async (req, res, next) => {
    const id = req.user.id;
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    try {
        const user = await userRepository.findOne(id, {
            select: ['id', 'first_name', 'last_name', 'email', 'role', 'created_at'],
        });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', `User with id:${id} not found.`, ['User not found.']);
            return next(customError);
        }
        res.customSuccess(200, 'User found', user);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.show = show;
//# sourceMappingURL=show.js.map