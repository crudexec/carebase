"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReferralInformation = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const referralInformation_1 = require("orm/entities/IntakeForm/referralInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addReferralInformation = async (req, res, next) => {
    try {
        const { date_of_referral, referral_source_name, referral_type, client_information_id, intake_full_id } = req.body;
        const referralInformationRepository = (0, typeorm_1.getRepository)(referralInformation_1.ReferralInformation);
        const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const user_id = req.user.id;
        const newReferralInformation = new referralInformation_1.ReferralInformation();
        newReferralInformation.date_of_referral = date_of_referral;
        newReferralInformation.referral_source_name = referral_source_name;
        newReferralInformation.referral_type = referral_type;
        newReferralInformation.registered_by = user_id;
        const savedReferralInformation = await referralInformationRepository.save(newReferralInformation);
        if (savedReferralInformation) {
            const newIntakeFullForm = new intakeFullForm_1.IntakeFullForm();
            const alreadyExistingIntakeFullForm = await intakeFullFormRepository.findOne({
                where: { id: intake_full_id, deleted_at: null },
            });
            if (alreadyExistingIntakeFullForm) {
                newIntakeFullForm.referral_information_id = savedReferralInformation.id;
                await intakeFullFormRepository.update(alreadyExistingIntakeFullForm.id, newIntakeFullForm);
            }
        }
        return res.customSuccess(200, 'Referral Information successfully created.', savedReferralInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error', null, err);
        return next(customError);
    }
};
exports.addReferralInformation = addReferralInformation;
//# sourceMappingURL=addReferralInformation.js.map