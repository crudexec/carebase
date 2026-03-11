"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillVaccinationEmployeeInformation = void 0;
const typeorm_1 = require("typeorm");
const employeeInformationForm_1 = require("orm/entities/PneumoccalVaccinationForm/employeeInformationForm");
const pneumococcalFullForm_1 = require("orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fillVaccinationEmployeeInformation = async (req, res, next) => {
    const { first_name, last_name, job_title, date_of_filling_form } = req.body;
    const employeeInformationRepository = (0, typeorm_1.getRepository)(employeeInformationForm_1.EmployeeInformation);
    const pneumococcalVaccinationFormRepository = (0, typeorm_1.getRepository)(pneumococcalFullForm_1.PneumococcalVaccinationFullForm);
    const user_id = req.user.id;
    try {
        const employeeInformation = await employeeInformationRepository.findOne({ where: { user_id } });
        if (employeeInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Employee personal information already exists for the pneumococcal form', [`Employee form already exists`]);
            return next(customError);
        }
        const newEmployeeInformation = new employeeInformationForm_1.EmployeeInformation();
        newEmployeeInformation.first_name = first_name;
        newEmployeeInformation.last_name = last_name;
        newEmployeeInformation.job_title = job_title;
        newEmployeeInformation.date_of_filling_form = date_of_filling_form;
        newEmployeeInformation.user_id = user_id;
        const savedEmployeeInformation = await employeeInformationRepository.save(newEmployeeInformation);
        if (savedEmployeeInformation) {
            const pneumococcalVaccinationForm = await pneumococcalVaccinationFormRepository.findOne({ where: { user_id } });
            if (pneumococcalVaccinationForm) {
                pneumococcalVaccinationForm.employee_information_id = savedEmployeeInformation.id;
                pneumococcalVaccinationForm.status = genericEnums_1.Status.IN_PROGRESS;
                await pneumococcalVaccinationFormRepository.save(pneumococcalVaccinationForm);
            }
            else {
                const newPneumococcalVaccinationForm = new pneumococcalFullForm_1.PneumococcalVaccinationFullForm();
                newPneumococcalVaccinationForm.user_id = user_id;
                newPneumococcalVaccinationForm.employee_information_id = savedEmployeeInformation.id;
                newPneumococcalVaccinationForm.status = genericEnums_1.Status.IN_PROGRESS;
                await pneumococcalVaccinationFormRepository.save(newPneumococcalVaccinationForm);
            }
        }
        return res.customSuccess(200, 'User employee information successfully created for the pneumococcal form.', savedEmployeeInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fillVaccinationEmployeeInformation = fillVaccinationEmployeeInformation;
//# sourceMappingURL=addPneumococcalEmployeeInformation.js.map