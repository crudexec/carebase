import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { TreatmentPlanDocuments } from 'orm/entities/TreatmentPlan/documentPlan';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const deleteTreatmentDocument = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const intake_full_id = req.params.intake_full_id;
    const { document_id } = req.body;

    const documentRepository = getRepository(TreatmentPlanDocuments);

    const alreadyExistingDocument = await documentRepository.findOne({
      where: {
        id: document_id,
        deleted_at: null,
      },
    });

    if (!alreadyExistingDocument) {
      const customError = new CustomError(400, 'Raw', 'Document not found', null, null);
      return next(customError);
    }

    await documentRepository.softDelete(document_id);

    return res.status(200).json({
      message: 'Document information deleted successfully',
    });
  } catch (error) {
    const customError = new CustomError(500, 'Raw', 'Error deleting document information', null, null);
    return next(customError);
  }
};
