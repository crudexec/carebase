"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillDocument = void 0;
const typeorm_1 = require("typeorm");
const document_1 = require("orm/entities/i9Form/document");
const i9form_1 = require("orm/entities/i9Form/i9form");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fillDocument = async (req, res, next) => {
    const documentData = req.body.documentData;
    const documentRepository = (0, typeorm_1.getRepository)(document_1.Documents);
    const documentDump = [];
    const owner = req.user.id;
    try {
        for (let i = 0; i < documentData.length; i++) {
            const { title, issuing_authority, document_number, file_url, expiration_date } = documentData[i];
            const document = await documentRepository.findOne({ where: { owner, title } });
            if (document) {
                const customError = new CustomError_1.CustomError(400, 'General', 'User document information with this title already exists for the i9 form', [`Document information already exists`]);
                return next(customError);
            }
            const newDocument = new document_1.Documents();
            newDocument.title = title;
            newDocument.issuing_authority = issuing_authority;
            newDocument.document_number = document_number;
            newDocument.file_url = file_url;
            newDocument.expiration_date = expiration_date;
            newDocument.owner = owner;
            await documentRepository.save(newDocument);
            documentDump.push(newDocument);
        }
        if (documentDump.length > 0) {
            const i9FormRepository = (0, typeorm_1.getRepository)(i9form_1.I9Form);
            const i9Form = await i9FormRepository.findOne({ where: { owner } });
            if (i9Form) {
                i9Form.document_id = documentDump[0].id;
                i9Form.status = genericEnums_1.Status.IN_PROGRESS;
                await i9FormRepository.save(i9Form);
            }
            else {
                const newI9Form = new i9form_1.I9Form();
                newI9Form.owner = owner;
                newI9Form.document_id = documentDump[0].id;
                newI9Form.status = genericEnums_1.Status.IN_PROGRESS;
                await i9FormRepository.save(newI9Form);
            }
        }
        return res.customSuccess(200, 'User document data successfully created for the i9 form.', documentDump);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fillDocument = fillDocument;
//# sourceMappingURL=addDocument.js.map