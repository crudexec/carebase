"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveUserDocument = void 0;
const typeorm_1 = require("typeorm");
const Documents_1 = require("orm/entities/Documents");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ApproveUserDocument = async (req, res, next) => {
    const userDocumentRepository = (0, typeorm_1.getRepository)(Documents_1.UserDocument);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const form_id = req.params.id;
    try {
        const userDocumentData = await userDocumentRepository.findOne({
            where: {
                id: form_id,
                deleted_at: null,
            },
        });
        if (!userDocumentData) {
            const customError = new CustomError_1.CustomError(404, 'General', `User Document not found.`, ['User Document not found.']);
            return next(customError);
        }
        await userDocumentRepository.update({
            id: form_id,
        }, {
            status: genericEnums_1.Status.APPROVED,
        });
        const user = await userRepository.findOne({ where: { id: userDocumentData.owner } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', `User not found.`, ['User not found.']);
            return next(customError);
        }
        await (0, emailService_1.sendApproveMail)(user.first_name, `${userDocumentData.document_title}`, String(user.email));
        return res.customSuccess(200, `${userDocumentData.document_title} successfully approved.`, userDocumentData);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error Approving user document', null, err);
        return next(customError);
    }
};
exports.ApproveUserDocument = ApproveUserDocument;
//# sourceMappingURL=approveUserDocument.js.map