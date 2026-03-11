"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTreatmentDocument = void 0;
const typeorm_1 = require("typeorm");
const documentPlan_1 = require("orm/entities/TreatmentPlan/documentPlan");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const deleteTreatmentDocument = async (req, res, next) => {
    try {
        const intake_full_id = req.params.intake_full_id;
        const { document_id } = req.body;
        const documentRepository = (0, typeorm_1.getRepository)(documentPlan_1.TreatmentPlanDocuments);
        const alreadyExistingDocument = await documentRepository.findOne({
            where: {
                id: document_id,
                deleted_at: null,
            },
        });
        if (!alreadyExistingDocument) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Document not found', null, null);
            return next(customError);
        }
        await documentRepository.softDelete(document_id);
        return res.status(200).json({
            message: 'Document information deleted successfully',
        });
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(500, 'Raw', 'Error deleting document information', null, null);
        return next(customError);
    }
};
exports.deleteTreatmentDocument = deleteTreatmentDocument;
//# sourceMappingURL=deleteTreatmentPlanDocument.js.map