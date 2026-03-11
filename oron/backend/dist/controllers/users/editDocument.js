"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editUserDocument = void 0;
const typeorm_1 = require("typeorm");
const Documents_1 = require("orm/entities/Documents");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editUserDocument = async (req, res, next) => {
    let { document_title, document_url } = req.body;
    const documentRepository = (0, typeorm_1.getRepository)(Documents_1.UserDocument);
    const owner = req.user.id;
    const document_id = req.params.document_id;
    try {
        const document = await documentRepository.findOne({ where: { id: document_id, owner } });
        if (document) {
            document_title = document_title ?? document.document_title;
            document_url = document_url ?? document.document_url;
            const updatedDocument = new Documents_1.UserDocument();
            updatedDocument.document_title = document_title;
            updatedDocument.document_url = document_url;
            updatedDocument.status = genericEnums_1.Status.AWAITING_APPROVAL;
            await documentRepository.update(document.id, updatedDocument);
            return res.customSuccess(200, 'User document data successfully updated', updatedDocument);
        }
        const customError = new CustomError_1.CustomError(400, 'General', 'User document information with this title not found', [
            `Document information does not exist`,
        ]);
        return next(customError);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editUserDocument = editUserDocument;
//# sourceMappingURL=editDocument.js.map