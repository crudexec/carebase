"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editReferralInformation = void 0;
const typeorm_1 = require("typeorm");
const referralInformation_1 = require("orm/entities/IntakeForm/referralInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editReferralInformation = async (req, res, next) => {
    try {
        let { date_of_referral, referral_source_name, referral_type } = req.body;
        const referralInformationRepository = (0, typeorm_1.getRepository)(referralInformation_1.ReferralInformation);
        const form_id = req.params.form_id;
        const referralInformation = await referralInformationRepository.findOne({ where: { id: form_id } });
        if (!referralInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Referral Information does not exist', [
                `Referral Information does not exist`,
            ]);
            return next(customError);
        }
        date_of_referral = date_of_referral ?? referralInformation.date_of_referral;
        referral_source_name = referral_source_name ?? referralInformation.referral_source_name;
        referral_type = referral_type ?? referralInformation.referral_type;
        const newReferralInformation = new referralInformation_1.ReferralInformation();
        newReferralInformation.date_of_referral = date_of_referral;
        newReferralInformation.referral_source_name = referral_source_name;
        newReferralInformation.referral_type = referral_type;
        await referralInformationRepository.update({ id: referralInformation.id }, newReferralInformation);
        return res.customSuccess(200, 'Referral Information successfully updated.', newReferralInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error', null, err);
        return next(customError);
    }
};
exports.editReferralInformation = editReferralInformation;
//# sourceMappingURL=editReferralInformation.js.map