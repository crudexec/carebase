import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Communication } from 'orm/entities/VisitLog/stepOne/communication';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editCommunication = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let {
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
      communication_id,
    } = req.body;

    const communicationRepository = getRepository(Communication);

    const communication = new Communication();

    const alreadyExistingCommunication = await communicationRepository.findOne({
      where: { id: communication_id, deleted_at: null },
    });

    if (!alreadyExistingCommunication) {
      const customError = new CustomError(404, 'General', `Communication not found`, ['Communication not found.']);
      return next(customError);
    }

    gestures = gestures ?? alreadyExistingCommunication.gestures;
    written_words = written_words ?? alreadyExistingCommunication.written_words;
    picture_communication_symbols =
      picture_communication_symbols ?? alreadyExistingCommunication.picture_communication_symbols;
    objects = objects ?? alreadyExistingCommunication.objects;
    short_phrases = short_phrases ?? alreadyExistingCommunication.short_phrases;
    repetitive_phrases = repetitive_phrases ?? alreadyExistingCommunication.repetitive_phrases;
    icons_pictures = icons_pictures ?? alreadyExistingCommunication.icons_pictures;
    verbal_sounds = verbal_sounds ?? alreadyExistingCommunication.verbal_sounds;
    type_words = type_words ?? alreadyExistingCommunication.type_words;
    single_words = single_words ?? alreadyExistingCommunication.single_words;
    photographs = photographs ?? alreadyExistingCommunication.photographs;
    sign_language = sign_language ?? alreadyExistingCommunication.sign_language;
    an_augmentative_communication_device =
      an_augmentative_communication_device ?? alreadyExistingCommunication.an_augmentative_communication_device;
    picture_exchange_communication_system =
      picture_exchange_communication_system ?? alreadyExistingCommunication.picture_exchange_communication_system;
    other = other ?? alreadyExistingCommunication.other;
    other_description = other_description ?? alreadyExistingCommunication.other_description;

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

    await communicationRepository.update({ id: communication_id }, communication);

    return res.customSuccess(200, 'Communication successfully updated.', communication);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Communication', null, err);
    return next(customError);
  }
};
