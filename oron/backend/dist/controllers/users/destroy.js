"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroy = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const destroy = async (req, res, next) => {
    const id = req.params.id;
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    try {
        const user = await userRepository.findOne({ where: { id } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Not Found', [`User with id:${id} doesn't exists.`]);
            return next(customError);
        }
        userRepository.softDelete(id);
        return res.customSuccess(200, 'User successfully deleted.', { id: user.id, email: user.email });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.destroy = destroy;
//# sourceMappingURL=destroy.js.map