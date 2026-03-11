"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addIntakeInformation = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const intakeInformation_1 = require("orm/entities/IntakeForm/intakeInformation");
const peoplePresent_1 = require("orm/entities/IntakeForm/peoplePresent");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addIntakeInformation = async (req, res, next) => {
    const { who_conducted_intake, date_of_intake, people_present, referral_information_id, intake_full_id } = req.body;
    const connection = (0, typeorm_1.getConnection)();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const intakeInformationRepository = (0, typeorm_1.getRepository)(intakeInformation_1.IntakeInformation);
    const peoplePresentInformationRepository = connection.getRepository(peoplePresent_1.PeoplePresentInformation);
    const intakeFullFormRepository = connection.getRepository(intakeFullForm_1.IntakeFullForm);
    const user_id = req.user.id;
    try {
        const newIntakeInformation = new intakeInformation_1.IntakeInformation();
        newIntakeInformation.who_conducted_intake = who_conducted_intake;
        newIntakeInformation.date_of_intake = date_of_intake;
        newIntakeInformation.registered_by = user_id;
        const savedIntakeInformation = await intakeInformationRepository.save(newIntakeInformation);
        if (people_present.length > 0) {
            people_present.forEach(async (person) => {
                const newPeoplePresentInformation = new peoplePresent_1.PeoplePresentInformation();
                newPeoplePresentInformation.first_name = person.first_name;
                newPeoplePresentInformation.relationship_to_participant = person.relationship_to_participant;
                newPeoplePresentInformation.registered_by = user_id;
                newPeoplePresentInformation.intake_information_id = savedIntakeInformation.id;
                await peoplePresentInformationRepository.save(newPeoplePresentInformation);
            });
            const savedPeoplePresentInformation = await peoplePresentInformationRepository.find({
                where: { intake_information_id: savedIntakeInformation.id },
            });
            const alreadyExistingIntakeFullForm = await intakeFullFormRepository.findOne({
                where: { id: intake_full_id, deleted_at: null },
            });
            const newIntakeFullForm = new intakeFullForm_1.IntakeFullForm();
            if (alreadyExistingIntakeFullForm) {
                newIntakeFullForm.intake_information_id = savedIntakeInformation.id;
                await intakeFullFormRepository.update(alreadyExistingIntakeFullForm.id, newIntakeFullForm);
            }
            await queryRunner.commitTransaction();
            return res.customSuccess(200, 'Intake Information successfully created.', {
                savedIntakeInformation,
                savedPeoplePresentInformation,
            });
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'People Present Information is required', [
                `People Present Information is required`,
            ]);
            await queryRunner.rollbackTransaction();
            return next(customError);
        }
    }
    catch (err) {
        await queryRunner.rollbackTransaction();
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
    finally {
        await queryRunner.release();
    }
};
exports.addIntakeInformation = addIntakeInformation;
//# sourceMappingURL=addIntakeInformation.js.map