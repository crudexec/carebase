import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { TreatmentPlanDocuments } from 'orm/entities/TreatmentPlan/documentPlan';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editTreatmentDocument = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const intake_full_id = req.params.intake_full_id;
    let { document_name, document_url, description, document_id } = req.body;

    const documentRepository = getRepository(TreatmentPlanDocuments);

    const alreadyExistingDocument = await documentRepository.findOne({
      where: {
        intake_full_id,
        id: document_id,
        deleted_at: null,
      },
    });

    if (!alreadyExistingDocument) {
      const customError = new CustomError(400, 'Raw', 'Document not found', null, null);
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
  } catch (error) {
    const customError = new CustomError(500, 'Raw', 'Error saving document information', null, null);
    return next(customError);
  }
};
