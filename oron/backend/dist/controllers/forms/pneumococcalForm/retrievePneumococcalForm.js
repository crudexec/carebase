"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrievePneumococcalVaccinationForm = void 0;
const typeorm_1 = require("typeorm");
const employeeInformationForm_1 = require("orm/entities/PneumoccalVaccinationForm/employeeInformationForm");
const pneumoccalSignature_1 = require("orm/entities/PneumoccalVaccinationForm/pneumoccalSignature");
const pneumococcalFullForm_1 = require("orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm");
const pneumococcalVaccinationForm_1 = require("orm/entities/PneumoccalVaccinationForm/pneumococcalVaccinationForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrievePneumococcalVaccinationForm = async (req, res, next) => {
    const pneumococcalVaccinationFormRepository = (0, typeorm_1.getRepository)(pneumococcalVaccinationForm_1.PneumococcalVaccinationForm);
    const employeeInformationRepository = (0, typeorm_1.getRepository)(employeeInformationForm_1.EmployeeInformation);
    const signatureRepository = (0, typeorm_1.getRepository)(pneumoccalSignature_1.PneumococcalSignatureForm);
    const pneumococcalVaccinationFullFormRepository = (0, typeorm_1.getRepository)(pneumococcalFullForm_1.PneumococcalVaccinationFullForm);
    const signed_by = req.user.id;
    try {
        const employeeInformation = (await employeeInformationRepository.findOne({ where: { user_id: signed_by } })) || {};
        const signature = (await signatureRepository.findOne({ where: { signed_by } })) || {};
        const pneumococcalVaccinationForm = (await pneumococcalVaccinationFormRepository.findOne({ where: { user_id: signed_by } })) || {};
        const pneumococcalVaccinationFullForm = (await pneumococcalVaccinationFullFormRepository.findOne({
            where: { user_id: signed_by },
        })) || { status: genericEnums_1.Status.NOT_STARTED };
        return res.customSuccess(200, 'User pneumococcal vaccination form successfully retrieved.', {
            employeeInformation,
            signature,
            pneumococcalVaccinationForm,
            pneumococcalVaccinationFullForm,
            status: pneumococcalVaccinationFullForm.status,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrievePneumococcalVaccinationForm = retrievePneumococcalVaccinationForm;
//# sourceMappingURL=retrievePneumococcalForm.js.map