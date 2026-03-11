"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendOfferLetter = void 0;
const typeorm_1 = require("typeorm");
const letter_1 = require("orm/entities/OfferLetter/letter");
const User_1 = require("orm/entities/User");
const constants_1 = require("types/constants");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const SendOfferLetter = async (req, res, next) => {
    const offerLetterRepository = await (0, typeorm_1.getRepository)(letter_1.OfferLetter);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const user_id = req.params.user_id;
    const { full_name, job_position, offer_letter_pdf_url } = req.body;
    try {
        const overview = constants_1.positionOverview[job_position];
        const user = await userRepository.findOne({ where: { id: user_id } });
        const newOfferLetter = new letter_1.OfferLetter();
        newOfferLetter.full_name = full_name;
        newOfferLetter.job_position = job_position;
        newOfferLetter.offer_letter_pdf_url = offer_letter_pdf_url;
        newOfferLetter.user_id = user.id;
        const offerLetter = await offerLetterRepository.save(newOfferLetter);
        if (offerLetter) {
            await (0, emailService_1.sendOfferLetter)(user.first_name, String(user.email));
            return res.customSuccess(200, 'Offer Letter successfully sent.', offerLetter);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', `Invalid employee email address. Please check and try again.`, null, err);
        return next(customError);
    }
};
exports.SendOfferLetter = SendOfferLetter;
//# sourceMappingURL=sendOfferLetter.js.map