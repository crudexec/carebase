"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorCreateCitizenship = void 0;
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const validatorCreateCitizenship = (req, res, next) => {
    const { citizenship_status } = req.body;
    const errorsValidation = [];
    if (!citizenship_status) {
        errorsValidation.push({ citizenship_status: 'Citizenship status is required' });
    }
    if (!Object.values(genericEnums_1.CitizenshipStatus).includes(citizenship_status)) {
        errorsValidation.push({
            citizenship_status: `Invalid citizenship status ${JSON.stringify(genericEnums_1.CitizenshipStatus)} are available`,
        });
    }
    if (errorsValidation.length !== 0) {
        const customError = new CustomError_1.CustomError(400, 'Validation', ' Citizenship Creation Failed!', null, null, errorsValidation);
        return next(customError);
    }
    return next();
};
exports.validatorCreateCitizenship = validatorCreateCitizenship;
//# sourceMappingURL=validateCitizenshipForm.js.map