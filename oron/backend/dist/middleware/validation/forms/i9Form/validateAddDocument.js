"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorAddDocument = void 0;
const CustomError_1 = require("utils/response/custom-error/CustomError");
const validatorAddDocument = (req, res, next) => {
    const errorsValidation = [];
    if (req.body.documentData.length === 0) {
        errorsValidation.push({ documentData: 'Document data is required' });
    }
    for (let i = 0; i < req.body.documentData.length; i++) {
        const { title, issuing_authority, document_number, file_url, expiration_date } = req.body.documentData[i];
        if (!title) {
            errorsValidation.push({ title: 'Title is required' });
        }
        if (!issuing_authority) {
            errorsValidation.push({ issuing_authority: 'Issuing authority is required' });
        }
        if (!file_url) {
            errorsValidation.push({ file_url: 'File url is required' });
        }
    }
    if (errorsValidation.length !== 0) {
        const customError = new CustomError_1.CustomError(400, 'Validation', 'Document Creation Failed!', null, null, errorsValidation);
        return next(customError);
    }
    return next();
};
exports.validatorAddDocument = validatorAddDocument;
//# sourceMappingURL=validateAddDocument.js.map