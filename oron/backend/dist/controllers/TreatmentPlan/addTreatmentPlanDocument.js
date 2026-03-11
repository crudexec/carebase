"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTreatmentDocument = void 0;
const typeorm_1 = require("typeorm");
const documentPlan_1 = require("orm/entities/TreatmentPlan/documentPlan");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addTreatmentDocument = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const intake_full_id = req.params.intake_full_id;
        const { document_name, document_url, description } = req.body;
        const documentRepository = (0, typeorm_1.getRepository)(documentPlan_1.TreatmentPlanDocuments);
        const newDocument = new documentPlan_1.TreatmentPlanDocuments();
        newDocument.uploaded_by = user_id;
        newDocument.document_name = document_name;
        newDocument.document_url = document_url;
        newDocument.description = description;
        newDocument.intake_full_id = intake_full_id;
        const document = await documentRepository.save(newDocument);
        return res.customSuccess(200, 'Document information saved successfully', document);
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(500, 'Raw', 'Error saving document information', null, null);
        return next(customError);
    }
};
exports.addTreatmentDocument = addTreatmentDocument;
//# sourceMappingURL=addTreatmentPlanDocument.js.map