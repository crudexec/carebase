"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const createJwtToken_1 = require("utils/createJwtToken");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const login = async (req, res, next) => {
    let { email } = req.body;
    const { password } = req.body;
    email = email.toLowerCase().trim();
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    try {
        const users = await userRepository.find();
        const user = await userRepository.findOne({ where: { email, deleted_at: null } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', 'User Not Found', ['Incorrect email or password']);
            return next(customError);
        }
        if (!user.checkIfPasswordMatch(password)) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Incorrect email or password', [
                'Incorrect email or password',
            ]);
            return next(customError);
        }
        const jwtPayload = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            account_id: user.account_id,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
        };
        try {
            const token = (0, createJwtToken_1.createJwtToken)(jwtPayload);
            res.customSuccess(200, 'Token successfully created.', `Bearer ${token}`);
        }
        catch (err) {
            const customError = new CustomError_1.CustomError(400, 'Raw', "Token can't be created", null, err);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.login = login;
//# sourceMappingURL=login.js.map