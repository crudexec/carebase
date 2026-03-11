"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const resetPassword = async (req, res, next) => {
    const { password } = req.body;
    const { token } = req.query;
    let jwtPayload;
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    try {
        jwtPayload = jsonwebtoken_1.default.verify(String(token), process.env.JWT_SECRET);
        ['iat', 'exp'].forEach((keyToRemove) => delete jwtPayload[keyToRemove]);
        if (!jwtPayload.email) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Token is invalid', [`Token is invalid.`]);
            return next(customError);
        }
        const user = await userRepository.findOne({ where: { email: jwtPayload.email } });
        user.password = password;
        user.hashPassword();
        await userRepository.update(user.id, user);
        return res.customSuccess(200, 'Password successfully reseted.');
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(401, 'Raw', 'JWT error', null, err);
        return next(customError);
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=resetPassword.js.map