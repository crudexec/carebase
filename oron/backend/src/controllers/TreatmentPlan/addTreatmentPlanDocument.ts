import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { TreatmentPlanDocuments } from 'orm/entities/TreatmentPlan/documentPlan';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addTreatmentDocument = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const intake_full_id = req.params.intake_full_id;
    const { document_name, document_url, description } = req.body;

    const documentRepository = getRepository(TreatmentPlanDocuments);

    const newDocument = new TreatmentPlanDocuments();
    newDocument.uploaded_by = user_id;
    newDocument.document_name = document_name;
    newDocument.document_url = document_url;
    newDocument.description = description;
    newDocument.intake_full_id = intake_full_id;

    const document = await documentRepository.save(newDocument);

    return res.customSuccess(200, 'Document information saved successfully', document);
  } catch (error) {
    const customError = new CustomError(500, 'Raw', 'Error saving document information', null, null);
    return next(customError);
  }
};
