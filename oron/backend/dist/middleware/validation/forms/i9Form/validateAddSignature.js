"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorAddSignature = void 0;
const CustomError_1 = require("utils/response/custom-error/CustomError");
const validatorAddSignature = (req, res, next) => {
    const { signature_data } = req.body;
    const errorsValidation = [];
    if (!signature_data) {
        errorsValidation.push({ signature_data: 'Signature data is required' });
    }
    if (errorsValidation.length !== 0) {
        const customError = new CustomError_1.CustomError(400, 'Validation', 'Signature Creation Failed!', null, null, errorsValidation);
        return next(customError);
    }
    return next();
};
exports.validatorAddSignature = validatorAddSignature;
//# sourceMappingURL=validateAddSignature.js.map