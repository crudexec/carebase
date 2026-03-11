"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveIntakeInformation = void 0;
const typeorm_1 = require("typeorm");
const intakeInformation_1 = require("orm/entities/IntakeForm/intakeInformation");
const peoplePresent_1 = require("orm/entities/IntakeForm/peoplePresent");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveIntakeInformation = async (req, res, next) => {
    const intakeInformationRepository = (0, typeorm_1.getRepository)(intakeInformation_1.IntakeInformation);
    const user_id = req.user.id;
    try {
        const intakeInformation = await intakeInformationRepository.findOne({ where: { user_id } });
        if (intakeInformation) {
            const people_present = await (0, typeorm_1.getRepository)(peoplePresent_1.PeoplePresentInformation).find({
                where: { intake_information_id: intakeInformation.id },
            });
            return res.customSuccess(200, 'Intake Information successfully retrieved.', {
                intakeInformation,
                people_present,
            });
        }
        else {
            return res.customSuccess(200, 'Intake Information has not been filled', null);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveIntakeInformation = retrieveIntakeInformation;
//# sourceMappingURL=retrieveIntakeInformation.js.map