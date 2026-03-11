"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveEmployeesFullIntake = void 0;
const typeorm_1 = require("typeorm");
const events_1 = require("orm/entities/Events/events");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const peoplePresent_1 = require("orm/entities/IntakeForm/peoplePresent");
const waiverService_1 = require("orm/entities/IntakeForm/waiverService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveEmployeesFullIntake = async (req, res, next) => {
    const intakeFullFormRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
    const waiverServiceRepository = (0, typeorm_1.getRepository)(waiverService_1.WaiverServices);
    const peoplePresentInformationRepository = (0, typeorm_1.getRepository)(peoplePresent_1.PeoplePresentInformation);
    const eventRepository = (0, typeorm_1.getRepository)(events_1.Events);
    const user_id = req.user.id;
    const intakeDump = [];
    const uniqueIntakes = new Set();
    try {
        const employeeEvents = await eventRepository.find({
            where: { employee_or_staff_id: user_id, deleted_at: null },
        });
        if (!employeeEvents) {
            return res.customSuccess(200, 'No events found for this employee.', []);
        }
        if (employeeEvents.length > 0) {
            for (let i = 0; i < employeeEvents.length; i++) {
                const intakeFullForm = await intakeFullFormRepository.findOne({
                    where: { id: employeeEvents[i].client_intake_id, deleted_at: null },
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
                if (uniqueIntakes.has(intakeFullForm?.id))
                    continue;
                let tempIntake = {};
                tempIntake = { ...intakeFullForm };
                if (intakeFullForm?.admissionInformation) {
                    const admission_information_id = intakeFullForm?.admissionInformation?.id;
                    const waiverService = await waiverServiceRepository.find({
                        where: { admission_information_id, deleted_at: null },
                    });
                    tempIntake['waiverService'] = waiverService;
                }
                if (intakeFullForm?.intakeInformation) {
                    const intake_information_id = intakeFullForm?.intakeInformation?.id;
                    const peoplePresent = await peoplePresentInformationRepository.find({
                        where: { intake_information_id, deleted_at: null },
                    });
                    tempIntake['peoplePresent'] = peoplePresent;
                }
                intakeDump.push(tempIntake);
                uniqueIntakes.add(intakeFullForm?.id);
            }
        }
        return res.customSuccess(200, 'Intake Full Form successfully retrieved for employee', intakeDump);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveEmployeesFullIntake = retrieveEmployeesFullIntake;
//# sourceMappingURL=retrieveEmployeeIntake.js.map