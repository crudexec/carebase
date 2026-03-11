import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Communication } from 'orm/entities/VisitLog/stepOne/communication';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addCommunication = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const {
      gestures,
      written_words,
      picture_communication_symbols,
      objects,
      short_phrases,
      repetitive_phrases,
      icons_pictures,
      verbal_sounds,
      type_words,
      single_words,
      photographs,
      sign_language,
      an_augmentative_communication_device,
      picture_exchange_communication_system,
      other,
      other_description,
      visit_full_form_id,
    } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;

    const communicationRepository = getRepository(Communication);
    const visitFullFormRepository = getRepository(VisitFullForm);

    const visitExists = await visitFullFormRepository.findOne({
      where: { id: visit_full_form_id, deleted_at: null },
    });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit Form not found`, ['Visit Form not found.']);
      return next(customError);
    }

    const communication = new Communication();

    communication.gestures = gestures;
    communication.written_words = written_words;
    communication.picture_communication_symbols = picture_communication_symbols;
    communication.objects = objects;
    communication.short_phrases = short_phrases;
    communication.repetitive_phrases = repetitive_phrases;
    communication.icons_pictures = icons_pictures;
    communication.verbal_sounds = verbal_sounds;
    communication.type_words = type_words;
    communication.single_words = single_words;
    communication.photographs = photographs;
    communication.sign_language = sign_language;
    communication.an_augmentative_communication_device = an_augmentative_communication_device;
    communication.picture_exchange_communication_system = picture_exchange_communication_system;
    communication.other = other;
    communication.other_description = other_description;
    communication.account_id = account_id;
    communication.status = Status.IN_PROGRESS;
    communication.registered_by = registered_by;
    communication.visit_full_form_id = visit_full_form_id;

    const savedCommunication = await communicationRepository.save(communication);

    if (savedCommunication) {
      await visitFullFormRepository.update(visit_full_form_id, { communication_id: savedCommunication.id });
    }

    return res.customSuccess(200, 'Communication successfully added.', savedCommunication);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Communication', null, err);
    return next(customError);
  }
};
