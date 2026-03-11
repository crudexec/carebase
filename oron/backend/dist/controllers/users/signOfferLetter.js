"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignOfferLetter = void 0;
const typeorm_1 = require("typeorm");
const letter_1 = require("orm/entities/OfferLetter/letter");
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const SignOfferLetter = async (req, res, next) => {
    const offerLetterRepository = await (0, typeorm_1.getRepository)(letter_1.OfferLetter);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const user_id = req.user.id;
    const { offer_letter_pdf_url } = req.body;
    try {
        const user = await userRepository.findOne({ where: { id: user_id } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', `User not found`, ['User not found.']);
            return next(customError);
        }
        const offerLetter = await offerLetterRepository.findOne({ where: { user_id }, order: { created_at: 'DESC' } });
        if (!offerLetter) {
            const customError = new CustomError_1.CustomError(404, 'General', `Offer Letter not found`, ['Offer Letter not found.']);
            return next(customError);
        }
        offerLetter.offer_letter_pdf_url = offer_letter_pdf_url;
        offerLetter.signed = true;
        await offerLetterRepository.update(offerLetter.id, offerLetter);
        return res.customSuccess(200, 'Offer Letter successfully signed.', offerLetter);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.SignOfferLetter = SignOfferLetter;
//# sourceMappingURL=signOfferLetter.js.map