"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveFullIntake = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const peoplePresent_1 = require("orm/entities/IntakeForm/peoplePresent");
const waiverService_1 = require("orm/entities/IntakeForm/waiverService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveFullIntake = async (req, res, next) => {
    const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
    const waiverServiceRepository = (0, typeorm_1.getRepository)(waiverService_1.WaiverServices);
    const peoplePresentInformationRepository = (0, typeorm_1.getRepository)(peoplePresent_1.PeoplePresentInformation);
    const account_id = req.user.account_id;
    const intakeDump = [];
    try {
        const intakeFullForm = await intakeFullFormRepository.find({
            where: { account_id, deleted_at: null },
            relations: [
                'admissionInformation',
                'clientInformation',
                'fatherContactInformation',
                'motherContactInformation',
                'schoolContactInformation',
                'moreAboutInformation',
                'medicalInformation',
                'referralInformation',
                'intakeInformation',
                'emergencyContactInformation',
                'serviceCoordinatorInformation',
            ],
        });
        let tempIntake = {};
        for (let i = 0; i < intakeFullForm.length; i++) {
            tempIntake = { ...intakeFullForm[i] };
            if (intakeFullForm[i].admissionInformation) {
                const admission_information_id = intakeFullForm[i].admissionInformation.id;
                const waiverService = await waiverServiceRepository.find({
                    where: { admission_information_id, deleted_at: null },
                });
                tempIntake['waiverService'] = waiverService;
            }
            if (intakeFullForm[i].intakeInformation) {
                const intake_information_id = intakeFullForm[i].intakeInformation.id;
                const peoplePresent = await peoplePresentInformationRepository.find({
                    where: { intake_information_id, deleted_at: null },
                });
                tempIntake['peoplePresent'] = peoplePresent;
            }
            intakeDump.push(tempIntake);
        }
        return res.customSuccess(200, 'Intake Full Form successfully retrieved.', intakeDump);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveFullIntake = retrieveFullIntake;
//# sourceMappingURL=retrieveIntake.js.map