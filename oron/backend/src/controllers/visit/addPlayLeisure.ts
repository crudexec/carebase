import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { PlayLeisure } from 'orm/entities/VisitLog/stepTwo/playLeisure';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addPlayLeisure = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const {
      puzzle,
      dance,
      arts_and_crafts,
      listen_to_music,
      icons_or_pictures,
      computer_games,
      short_naps,
      other,
      other_specify,
      visit_full_form_id,
    } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;

    const playLeisureRepository = getRepository(PlayLeisure);
    const visitFullFormRepository = getRepository(VisitFullForm);

    const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
      return next(customError);
    }

    const playLeisure = new PlayLeisure();

    playLeisure.puzzle = puzzle;
    playLeisure.dance = dance;
    playLeisure.arts_and_crafts = arts_and_crafts;
    playLeisure.listen_to_music = listen_to_music;
    playLeisure.icons_or_pictures = icons_or_pictures;
    playLeisure.computer_games = computer_games;
    playLeisure.short_naps = short_naps;
    playLeisure.other = other;
    playLeisure.other_specify = other_specify;
    playLeisure.account_id = account_id;
    playLeisure.status = Status.IN_PROGRESS;
    playLeisure.registered_by = registered_by;
    playLeisure.visit_full_form_id = visit_full_form_id;

    const savedPlayLeisure = await playLeisureRepository.save(playLeisure);

    if (savedPlayLeisure) {
      await visitFullFormRepository.update(visit_full_form_id, {
        play_leisure_id: savedPlayLeisure.id,
      });
    }

    return res.customSuccess(200, 'Play Leisure successfully added.', savedPlayLeisure);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Play Leisure', null, err);
    return next(customError);
  }
};
