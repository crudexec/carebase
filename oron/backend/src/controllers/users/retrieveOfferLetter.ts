import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { OfferLetter } from 'orm/entities/OfferLetter/letter';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const RetrieveOfferLetter = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const offerLetterRepository = await getRepository(OfferLetter);
  const user_id = req.user.id;
  try {
    const offerLetter = await offerLetterRepository.findOne({ where: { user_id }, order: { created_at: 'DESC' } });

    if (!offerLetter) {
      const customError = new CustomError(404, 'General', `Offer Letter not found`, ['Offer Letter not found.']);
      return next(customError);
    }
    return res.customSuccess(200, 'Offer Letter successfully retrieved.', offerLetter);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error retrieving offer letter', null, err);
    return next(customError);
  }
};
