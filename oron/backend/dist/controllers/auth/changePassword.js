"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const changePassword = async (req, res, next) => {
    const { password, passwordNew } = req.body;
    const { id, email } = req.jwtPayload;
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    try {
        const user = await userRepository.findOne({ where: { id } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Not Found', [`User with ${email} not found.`]);
            return next(customError);
        }
        if (!user.checkIfPasswordMatch(password)) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Not Found', ['Incorrect password']);
            return next(customError);
        }
        user.password = passwordNew;
        user.hashPassword();
        userRepository.save(user);
        res.customSuccess(200, 'Password successfully changed.');
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=changePassword.js.map