"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editIntakeInformation = void 0;
const typeorm_1 = require("typeorm");
const intakeInformation_1 = require("orm/entities/IntakeForm/intakeInformation");
const peoplePresent_1 = require("orm/entities/IntakeForm/peoplePresent");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editIntakeInformation = async (req, res, next) => {
    let { who_conducted_intake, date_of_intake, people_present } = req.body;
    const intakeInformationRepository = (0, typeorm_1.getRepository)(intakeInformation_1.IntakeInformation);
    const peoplePresentInformationRepository = (0, typeorm_1.getRepository)(peoplePresent_1.PeoplePresentInformation);
    const user_id = req.user.id;
    const form_id = req.params.form_id;
    const allPresentPresent = [];
    try {
        const intakeInformation = await intakeInformationRepository.findOne({ where: { id: form_id } });
        if (intakeInformation) {
            who_conducted_intake = who_conducted_intake ?? intakeInformation.who_conducted_intake;
            date_of_intake = date_of_intake ?? intakeInformation.date_of_intake;
            const peoplePresentSaved = await peoplePresentInformationRepository.find({
                where: { intake_information_id: intakeInformation.id },
            });
            const newIntakeInformation = new intakeInformation_1.IntakeInformation();
            newIntakeInformation.who_conducted_intake = who_conducted_intake;
            newIntakeInformation.date_of_intake = date_of_intake;
            let current_people_present;
            if (people_present.length > 0) {
                for (const person of people_present) {
                    let newPeoplePresentInformation = new peoplePresent_1.PeoplePresentInformation();
                    const personPresent = peoplePresentSaved.find((p) => p.first_name === person.first_name);
                    if (personPresent) {
                        newPeoplePresentInformation = personPresent;
                        newPeoplePresentInformation.relationship_to_participant = person.relationship_to_participant;
                        current_people_present = await peoplePresentInformationRepository.update({ id: personPresent.id }, newPeoplePresentInformation);
                        allPresentPresent.push(current_people_present);
                    }
                    else {
                        newPeoplePresentInformation.first_name = person.first_name;
                        newPeoplePresentInformation.relationship_to_participant = person.relationship_to_participant;
                        newPeoplePresentInformation.intake_information_id = intakeInformation.id;
                        newPeoplePresentInformation.registered_by = user_id;
                        current_people_present = await peoplePresentInformationRepository.save(newPeoplePresentInformation);
                        allPresentPresent.push(current_people_present);
                    }
                }
            }
            await intakeInformationRepository.update({ id: intakeInformation.id }, newIntakeInformation);
            return res.customSuccess(200, 'Intake Information successfully updated.', {
                newIntakeInformation,
                allPresentPresent,
            });
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Intake Information does not exist', [
                `Intake Information does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editIntakeInformation = editIntakeInformation;
//# sourceMappingURL=editIntakeInformation.js.map