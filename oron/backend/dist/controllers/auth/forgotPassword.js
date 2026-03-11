"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const createJwtToken_1 = require("utils/createJwtToken");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const forgotPassword = async (req, res, next) => {
    let { email } = req.body;
    try {
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        email = email.toLowerCase().trim();
        const user = await userRepository.findOne({ where: { email, deleted_at: null } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', 'User Not Found', ['User not found']);
            return next(customError);
        }
        const jwtPayload = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            account_id: user.account_id,
            role: user.role,
            created_at: user.created_at,
        };
        const token = (0, createJwtToken_1.createJwtToken)(jwtPayload);
        const resetLink = `${process.env.FRONTEND_URL}/create-new-password?token=${token}`;
        await (0, emailService_1.SendForgotPasswordEmail)(user.first_name, resetLink, user.email);
        return res.customSuccess(200, 'Forgot password email sent.', user);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', `Can't send forgot password`, null, err);
        return next(customError);
    }
};
exports.forgotPassword = forgotPassword;
//# sourceMappingURL=forgotPassword.js.map