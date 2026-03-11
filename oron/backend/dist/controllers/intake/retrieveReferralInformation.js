"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveReferalInformation = void 0;
const typeorm_1 = require("typeorm");
const referralInformation_1 = require("orm/entities/IntakeForm/referralInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveReferalInformation = async (req, res, next) => {
    const referralInformationRepository = (0, typeorm_1.getRepository)(referralInformation_1.ReferralInformation);
    const user_id = req.user.id;
    try {
        const referralInformation = await referralInformationRepository.findOne({ where: { user_id } });
        if (referralInformation) {
            return res.customSuccess(200, 'Referral Information successfully retrieved.', referralInformation);
        }
        else {
            return res.customSuccess(200, 'Referral Information has not been filled', null);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveReferalInformation = retrieveReferalInformation;
//# sourceMappingURL=retrieveReferralInformation.js.map