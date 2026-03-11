"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrieveUserOfferLetter = void 0;
const typeorm_1 = require("typeorm");
const letter_1 = require("orm/entities/OfferLetter/letter");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const RetrieveUserOfferLetter = async (req, res, next) => {
    const offerLetterRepository = await (0, typeorm_1.getRepository)(letter_1.OfferLetter);
    const user_id = req.params.user_id;
    try {
        const offerLetter = await offerLetterRepository.findOne({ where: { user_id }, order: { created_at: 'DESC' } });
        if (!offerLetter) {
            const customError = new CustomError_1.CustomError(404, 'General', `Offer Letter not found`, ['Offer Letter not found.']);
            return next(customError);
        }
        return res.customSuccess(200, 'Offer Letter successfully retrieved for user.', offerLetter);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error retrieving offer letter', null, err);
        return next(customError);
    }
};
exports.RetrieveUserOfferLetter = RetrieveUserOfferLetter;
//# sourceMappingURL=retrieveUserOfferLetter.js.map