import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { OfferLetter } from 'orm/entities/OfferLetter/letter';
import { User } from 'orm/entities/User';
import { positionOverview } from 'types/constants';
import { JwtPayload } from 'types/JwtPayload';
import { sendOfferLetter } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const SignOfferLetter = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const offerLetterRepository = await getRepository(OfferLetter);
  const userRepository = getRepository(User);
  const user_id = req.user.id;
  const { offer_letter_pdf_url } = req.body;
  try {
    const user = await userRepository.findOne({ where: { id: user_id } });

    if (!user) {
      const customError = new CustomError(404, 'General', `User not found`, ['User not found.']);
      return next(customError);
    }

    const offerLetter = await offerLetterRepository.findOne({ where: { user_id }, order: { created_at: 'DESC' } });

    if (!offerLetter) {
      const customError = new CustomError(404, 'General', `Offer Letter not found`, ['Offer Letter not found.']);
      return next(customError);
    }

    offerLetter.offer_letter_pdf_url = offer_letter_pdf_url;
    offerLetter.signed = true;

    await offerLetterRepository.update(offerLetter.id, offerLetter);

    return res.customSuccess(200, 'Offer Letter successfully signed.', offerLetter);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
