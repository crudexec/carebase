"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorCreatePersonalInformation = void 0;
const validator_1 = __importDefault(require("validator"));
const CustomError_1 = require("utils/response/custom-error/CustomError");
const validatorCreatePersonalInformation = (req, res, next) => {
    const { first_name, last_name, email, phone, address, city, state, zip_code } = req.body;
    const errorsValidation = [];
    if (!first_name) {
        errorsValidation.push({ first_name: 'First name is required' });
    }
    if (!last_name) {
        errorsValidation.push({ last_name: 'Last name is required' });
    }
    if (!email && validator_1.default.isEmail(email)) {
        errorsValidation.push({ email: 'Email is required' });
    }
    if (!phone) {
        errorsValidation.push({ phone: 'Phone is required' });
    }
    if (!address) {
        errorsValidation.push({ address: 'Address is required' });
    }
    if (!city) {
        errorsValidation.push({ city: 'City is required' });
    }
    if (!state) {
        errorsValidation.push({ state: 'State is required' });
    }
    if (!zip_code) {
        errorsValidation.push({ zip_code: 'Zip code is required' });
    }
    if (errorsValidation.length !== 0) {
        const customError = new CustomError_1.CustomError(400, 'Validation', 'Register validation error', null, null, errorsValidation);
        return next(customError);
    }
    return next();
};
exports.validatorCreatePersonalInformation = validatorCreatePersonalInformation;
//# sourceMappingURL=validatePersonalInformation.js.map