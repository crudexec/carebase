"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadUserDocument = void 0;
const typeorm_1 = require("typeorm");
const Documents_1 = require("orm/entities/Documents");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const uploadUserDocument = async (req, res, next) => {
    const { document_title, document_url } = req.body;
    const documentRepository = (0, typeorm_1.getRepository)(Documents_1.UserDocument);
    const owner = req.user.id;
    try {
        const document = await documentRepository.findOne({ where: { owner, document_title } });
        if (document) {
            const customError = new CustomError_1.CustomError(400, 'General', 'User document information with this title already exists', [
                `Document information already exists`,
            ]);
            return next(customError);
        }
        const newDocument = new Documents_1.UserDocument();
        newDocument.document_title = document_title;
        newDocument.document_url = document_url;
        newDocument.owner = owner;
        newDocument.status = genericEnums_1.Status.AWAITING_APPROVAL;
        const documentData = await documentRepository.save(newDocument);
        return res.customSuccess(200, 'User document data successfully created for the i9 form.', documentData);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.uploadUserDocument = uploadUserDocument;
//# sourceMappingURL=addDocument.js.map