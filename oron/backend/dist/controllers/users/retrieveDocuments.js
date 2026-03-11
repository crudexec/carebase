"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveUserDocuments = void 0;
const typeorm_1 = require("typeorm");
const Documents_1 = require("orm/entities/Documents");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveUserDocuments = async (req, res, next) => {
    const documentRepository = (0, typeorm_1.getRepository)(Documents_1.UserDocument);
    const owner = req.user.id;
    try {
        const document = await documentRepository.find({ where: { owner, deleted_at: null } });
        if (document.length > 0) {
            return res.customSuccess(200, 'User document data successfully retrieved', document);
        }
        return res.customSuccess(200, 'No user document data found', []);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveUserDocuments = retrieveUserDocuments;
//# sourceMappingURL=retrieveDocuments.js.map