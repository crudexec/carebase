"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const typeorm_1 = require("typeorm");
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("orm/entities/User");
const types_1 = require("orm/entities/types");
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
const createUser = async (req, res, next) => {
    let { first_name, last_name, email, role } = req.body;
    if (!first_name || !last_name || !email || !role) {
        const customError = new CustomError_1.CustomError(400, 'Validation', 'Missing required fields', [
            'first_name, last_name, email, and role are required',
        ]);
        return next(customError);
    }
    const validRoles = Object.values(types_1.Role);
    if (!validRoles.includes(role)) {
        const customError = new CustomError_1.CustomError(400, 'Validation', 'Invalid role', [
            `Role must be one of: ${validRoles.join(', ')}`,
        ]);
        return next(customError);
    }
    email = email.toLowerCase().trim();
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    try {
        const existingUser = await userRepository.findOne({ where: { email, deleted_at: null } });
        if (existingUser) {
            const customError = new CustomError_1.CustomError(400, 'General', 'User already exists', [
                `Email '${email}' already exists`,
            ]);
            return next(customError);
        }
        const generatedPassword = generatePassword(12);
        const newUser = new User_1.User();
        newUser.email = email;
        newUser.password = generatedPassword;
        newUser.first_name = first_name;
        newUser.last_name = last_name;
        newUser.role = role;
        newUser.account_id = 'creed';
        newUser.hashPassword();
        const userData = await userRepository.save(newUser);
        res.customSuccess(200, 'User successfully created.', {
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            role: userData.role,
            generated_password: generatedPassword,
            created_at: userData.created_at,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', `User '${email}' can't be created`, null, err);
        return next(customError);
    }
};
exports.createUser = createUser;
//# sourceMappingURL=createUser.js.map