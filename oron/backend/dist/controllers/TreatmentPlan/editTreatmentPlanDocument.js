"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTreatmentDocument = void 0;
const typeorm_1 = require("typeorm");
const documentPlan_1 = require("orm/entities/TreatmentPlan/documentPlan");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editTreatmentDocument = async (req, res, next) => {
    try {
        const intake_full_id = req.params.intake_full_id;
        let { document_name, document_url, description, document_id } = req.body;
        const documentRepository = (0, typeorm_1.getRepository)(documentPlan_1.TreatmentPlanDocuments);
        const alreadyExistingDocument = await documentRepository.findOne({
            where: {
                intake_full_id,
                id: document_id,
                deleted_at: null,
            },
        });
        if (!alreadyExistingDocument) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Document not found', null, null);
            return next(customError);
        }
        document_name = document_name ?? alreadyExistingDocument.document_name;
        document_url = document_url ?? alreadyExistingDocument.document_url;
        description = description ?? alreadyExistingDocument.description;
        alreadyExistingDocument.document_name = document_name;
        alreadyExistingDocument.document_url = document_url;
        alreadyExistingDocument.description = description;
        await documentRepository.update(document_id, alreadyExistingDocument);
        const document = await documentRepository.findOne({
            where: {
                id: document_id,
                deleted_at: null,
            },
        });
        return res.status(200).json({
            message: 'Document information updated successfully',
            document,
        });
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(500, 'Raw', 'Error saving document information', null, null);
        return next(customError);
    }
};
exports.editTreatmentDocument = editTreatmentDocument;
//# sourceMappingURL=editTreatmentPlanDocument.js.map