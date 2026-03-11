"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPlayLeisure = void 0;
const typeorm_1 = require("typeorm");
const playLeisure_1 = require("orm/entities/VisitLog/stepTwo/playLeisure");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editPlayLeisure = async (req, res, next) => {
    try {
        let { puzzle, dance, arts_and_crafts, listen_to_music, icons_or_pictures, computer_games, short_naps, other, other_specify, play_leisure_id, } = req.body;
        const playLeisureRepository = (0, typeorm_1.getRepository)(playLeisure_1.PlayLeisure);
        const playLeisureExists = await playLeisureRepository.findOne({ where: { id: play_leisure_id, deleted_at: null } });
        if (!playLeisureExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Play Leisure not found`, ['Play Leisure not found.']);
            return next(customError);
        }
        puzzle = puzzle ?? playLeisureExists.puzzle;
        dance = dance ?? playLeisureExists.dance;
        arts_and_crafts = arts_and_crafts ?? playLeisureExists.arts_and_crafts;
        listen_to_music = listen_to_music ?? playLeisureExists.listen_to_music;
        icons_or_pictures = icons_or_pictures ?? playLeisureExists.icons_or_pictures;
        computer_games = computer_games ?? playLeisureExists.computer_games;
        short_naps = short_naps ?? playLeisureExists.short_naps;
        other = other ?? playLeisureExists.other;
        other_specify = other_specify ?? playLeisureExists.other_specify;
        const playLeisure = new playLeisure_1.PlayLeisure();
        playLeisure.puzzle = puzzle;
        playLeisure.dance = dance;
        playLeisure.arts_and_crafts = arts_and_crafts;
        playLeisure.listen_to_music = listen_to_music;
        playLeisure.icons_or_pictures = icons_or_pictures;
        playLeisure.computer_games = computer_games;
        playLeisure.short_naps = short_naps;
        playLeisure.other = other;
        playLeisure.other_specify = other_specify;
        await playLeisureRepository.update(play_leisure_id, playLeisure);
        return res.status(200).json({
            message: 'Play Leisure Updated Successfully',
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Updating Play Leisure', null, err);
        return next(customError);
    }
};
exports.editPlayLeisure = editPlayLeisure;
//# sourceMappingURL=editPlayLeisure.js.map