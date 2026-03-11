"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const register = async (req, res, next) => {
    let { first_name, last_name, email, password } = req.body;
    email = email.toLowerCase().trim();
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    try {
        const user = await userRepository.findOne({ where: { email, deleted_at: null } });
        if (user) {
            const customError = new CustomError_1.CustomError(400, 'General', 'User already exists', [
                `Email '${user.email}' already exists`,
            ]);
            return next(customError);
        }
        const newUser = new User_1.User();
        newUser.email = email;
        newUser.password = password;
        newUser.first_name = first_name;
        newUser.last_name = last_name;
        newUser.account_id = 'creed';
        newUser.hashPassword();
        const userData = await userRepository.save(newUser);
        res.customSuccess(200, 'User successfully created.', userData);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', `User '${email}' can't be created`, null, err);
        return next(customError);
    }
};
exports.register = register;
//# sourceMappingURL=register.js.map