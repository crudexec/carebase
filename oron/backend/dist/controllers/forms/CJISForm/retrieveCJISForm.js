"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveCJISForm = void 0;
const typeorm_1 = require("typeorm");
const cjisEmployeeInformation_1 = require("orm/entities/CJISForm/cjisEmployeeInformation");
const cjisFullForm_1 = require("orm/entities/CJISForm/cjisFullForm");
const cjisPreRegistration_1 = require("orm/entities/CJISForm/cjisPreRegistration");
const cjisSignature_1 = require("orm/entities/CJISForm/cjisSignature");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveCJISForm = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const cjisFullFormRepository = (0, typeorm_1.getRepository)(cjisFullForm_1.CJISFullForm);
        const cjisEmployeeInformationRepository = (0, typeorm_1.getRepository)(cjisEmployeeInformation_1.CJISEmployeeInformation);
        const cjisSignatureFormRepository = (0, typeorm_1.getRepository)(cjisSignature_1.CJISSignatureForm);
        const cjisForm = await cjisFullFormRepository.findOne({ where: { user_id } });
        const employeeInformation = await cjisEmployeeInformationRepository.findOne({
            where: { id: cjisForm.employee_information_id },
        });
        const signatureForm = await cjisSignatureFormRepository.findOne({ where: { id: cjisForm.signature_id } });
        const preRegistrationForm = await (0, typeorm_1.getRepository)(cjisPreRegistration_1.CJISPreRegistrationForm).findOne({ where: { user_id } });
        if (cjisForm && employeeInformation && signatureForm) {
            return res.customSuccess(200, 'A Fully filled CJIS Form retrieved successfully.', {
                cjisForm,
                employeeInformation,
                signatureForm,
                preRegistrationForm,
            });
        }
        return res.customSuccess(200, 'CJIS Form retrieved successfully.', {
            cjisForm,
            employeeInformation,
            signatureForm,
            preRegistrationForm,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error retrieving CJIS Form', null, err);
        return next(customError);
    }
};
exports.retrieveCJISForm = retrieveCJISForm;
//# sourceMappingURL=retrieveCJISForm.js.map