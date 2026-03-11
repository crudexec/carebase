"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserPassword = void 0;
const typeorm_1 = require("typeorm");
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const generatePassword = (length = 12) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    password += uppercase[crypto_1.default.randomInt(uppercase.length)];
    password += lowercase[crypto_1.default.randomInt(lowercase.length)];
    password += numbers[crypto_1.default.randomInt(numbers.length)];
    password += symbols[crypto_1.default.randomInt(symbols.length)];
    for (let i = password.length; i < length; i++) {
        password += allChars[crypto_1.default.randomInt(allChars.length)];
    }
    return password
        .split('')
        .sort(() => crypto_1.default.randomInt(3) - 1)
        .join('');
};
const resetUserPassword = async (req, res, next) => {
    const { user_id } = req.params;
    if (!user_id) {
        const customError = new CustomError_1.CustomError(400, 'Validation', 'Missing user_id parameter');
        return next(customError);
    }
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    try {
        const user = await userRepository.findOne({ where: { id: user_id, deleted_at: null } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', 'User not found');
            return next(customError);
        }
        const newPassword = generatePassword(12);
        user.password = newPassword;
        user.hashPassword();
        await userRepository.save(user);
        res.customSuccess(200, 'Password successfully reset.', {
            user_id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            new_password: newPassword,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Failed to reset password', null, err);
        return next(customError);
    }
};
exports.resetUserPassword = resetUserPassword;
//# sourceMappingURL=resetUserPassword.js.map