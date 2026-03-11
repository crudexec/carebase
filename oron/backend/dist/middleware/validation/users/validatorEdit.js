"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorEdit = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const validatorEdit = async (req, res, next) => {
    let { first_name, last_name, email } = req.body;
    const errorsValidation = [];
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    first_name = !first_name ? '' : first_name;
    last_name = !last_name ? '' : last_name;
    const user = await userRepository.findOne({ email });
    if (user) {
        errorsValidation.push({ username: `Username ${email} already exists` });
    }
    if (errorsValidation.length !== 0) {
        const customError = new CustomError_1.CustomError(400, 'Validation', 'Edit user validation error', null, null, errorsValidation);
        return next(customError);
    }
    return next();
};
exports.validatorEdit = validatorEdit;
//# sourceMappingURL=validatorEdit.js.map