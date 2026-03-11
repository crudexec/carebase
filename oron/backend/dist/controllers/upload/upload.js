"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDocument = void 0;
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fileParser_1 = require("utils/upload/fileParser");
const uploadDocument = async (req, res, next) => {
    try {
        const parsedFile = await (0, fileParser_1.parseFile)(req);
        return res.customSuccess(200, 'Document successfully uploaded.', parsedFile);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.uploadDocument = uploadDocument;
//# sourceMappingURL=upload.js.map