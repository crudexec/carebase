import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { OfferLetter } from 'orm/entities/OfferLetter/letter';
import { User } from 'orm/entities/User';
import { positionOverview } from 'types/constants';
import { sendOfferLetter } from 'utils/emailService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const SendOfferLetter = async (req: Request, res: Response, next: NextFunction) => {
  const offerLetterRepository = await getRepository(OfferLetter);
  const userRepository = getRepository(User);
  const user_id = req.params.user_id;
  const { full_name, job_position, offer_letter_pdf_url } = req.body;
  try {
    const overview = positionOverview[job_position];

    const user = await userRepository.findOne({ where: { id: user_id } });

    const newOfferLetter = new OfferLetter();
    newOfferLetter.full_name = full_name;
    newOfferLetter.job_position = job_position;
    newOfferLetter.offer_letter_pdf_url = offer_letter_pdf_url;
    newOfferLetter.user_id = user.id;

    const offerLetter = await offerLetterRepository.save(newOfferLetter);

    if (offerLetter) {
      await sendOfferLetter(user.first_name, String(user.email));
      return res.customSuccess(200, 'Offer Letter successfully sent.', offerLetter);
    }
  } catch (err) {
    const customError = new CustomError(
      400,
      'Raw',
      `Invalid employee email address. Please check and try again.`,
      null,
      err,
    );
    return next(customError);
  }
};
