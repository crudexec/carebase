"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmployeeInformation = void 0;
const typeorm_1 = require("typeorm");
const cjisEmployeeInformation_1 = require("orm/entities/CJISForm/cjisEmployeeInformation");
const cjisFullForm_1 = require("orm/entities/CJISForm/cjisFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addEmployeeInformation = async (req, res, next) => {
    const { first_name, last_name, date_of_hire, employee_id, job_title } = req.body;
    try {
        const cjisEmployeeInformationRepository = (0, typeorm_1.getRepository)(cjisEmployeeInformation_1.CJISEmployeeInformation);
        const cjisFullFormRepository = (0, typeorm_1.getRepository)(cjisFullForm_1.CJISFullForm);
        const user_id = req.user.id;
        const cjisForm = await cjisFullFormRepository.findOne({ where: { user_id } });
        if (cjisForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'CJIS Form already exists', [`CJIS Form already exists`]);
            return next(customError);
        }
        const newCJISEmployeeInformation = new cjisEmployeeInformation_1.CJISEmployeeInformation();
        newCJISEmployeeInformation.first_name = first_name;
        newCJISEmployeeInformation.last_name = last_name;
        newCJISEmployeeInformation.date_of_hire = date_of_hire;
        newCJISEmployeeInformation.employee_id = employee_id;
        newCJISEmployeeInformation.job_title = job_title;
        newCJISEmployeeInformation.user_id = user_id;
        const savedCJISEmployeeInformation = await cjisEmployeeInformationRepository.save(newCJISEmployeeInformation);
        if (savedCJISEmployeeInformation) {
            const newCJISForm = new cjisFullForm_1.CJISFullForm();
            const alreadyExists = await cjisFullFormRepository.findOne({ where: { user_id } });
            if (alreadyExists) {
                newCJISForm.employee_information_id = savedCJISEmployeeInformation.id;
                newCJISForm.status = genericEnums_1.Status.IN_PROGRESS;
                await cjisFullFormRepository.update(cjisForm.id, newCJISForm);
            }
            newCJISForm.user_id = user_id;
            newCJISForm.employee_information_id = savedCJISEmployeeInformation.id;
            newCJISForm.status = genericEnums_1.Status.IN_PROGRESS;
            await cjisFullFormRepository.save(newCJISForm);
        }
        return res.customSuccess(200, 'CJIS Employee Information successfully created.', savedCJISEmployeeInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addEmployeeInformation = addEmployeeInformation;
//# sourceMappingURL=addEmployeeInformation.js.map