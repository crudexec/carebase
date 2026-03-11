"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserNotFilledForms = void 0;
const typeorm_1 = require("typeorm");
const cjisFullForm_1 = require("orm/entities/CJISForm/cjisFullForm");
const personalInformation_1 = require("orm/entities/EmployeeDemographicForm/personalInformation");
const fluFullForm_1 = require("orm/entities/FluForm/fluFullForm");
const HepatitisFullForm_1 = require("orm/entities/HepatitisBForm/HepatitisFullForm");
const i9form_1 = require("orm/entities/i9Form/i9form");
const mmrFullForm_1 = require("orm/entities/MMRVaccineForm/mmrFullForm");
const pneumococcalFullForm_1 = require("orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm");
const reference_1 = require("orm/entities/ReferenceForm/reference");
const tuberculosisFullForm_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm");
const types_1 = require("orm/entities/types");
const User_1 = require("orm/entities/User");
const userBioData_1 = require("orm/entities/userBioData");
const varicellaFullForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaFullForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fetchUserNotFilledForms = async (req, res, next) => {
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const user_id = req.params.id;
    const userBioDataRepository = (0, typeorm_1.getRepository)(userBioData_1.UserBioData);
    const employeeDemographicRepository = (0, typeorm_1.getRepository)(personalInformation_1.EmployeePersonalInformation);
    const fluFullFormRepository = (0, typeorm_1.getRepository)(fluFullForm_1.FluFullForm);
    const hepatitisBFullFormRepository = (0, typeorm_1.getRepository)(HepatitisFullForm_1.HepatitisBFullForm);
    const i9FormRepository = (0, typeorm_1.getRepository)(i9form_1.I9Form);
    const mmrFullFormRepository = (0, typeorm_1.getRepository)(mmrFullForm_1.MMRFullForm);
    const pneumococcalVaccinationFullFormRepository = (0, typeorm_1.getRepository)(pneumococcalFullForm_1.PneumococcalVaccinationFullForm);
    const tuberculosisFullFormRepository = (0, typeorm_1.getRepository)(tuberculosisFullForm_1.TuberculosisFullForm);
    const varicellaFullFormRepository = (0, typeorm_1.getRepository)(varicellaFullForm_1.VaricellaFullForm);
    const referenceFormRepository = (0, typeorm_1.getRepository)(reference_1.ReferenceForm);
    const cjisFullFormRepository = (0, typeorm_1.getRepository)(cjisFullForm_1.CJISFullForm);
    try {
        const user = await userRepository.findOne({ where: { id: user_id, role: types_1.Role.STANDARD } });
        const userBioData = await userBioDataRepository.findOne({
            where: { user_id: user_id },
        });
        const employeeDemographicInformation = await employeeDemographicRepository.findOne({
            where: { user_id },
        });
        const fluFullForm = await fluFullFormRepository.findOne({ where: { user_id } });
        const hepatitisBFullForm = await hepatitisBFullFormRepository.findOne({
            where: { user_id },
        });
        const i9Form = await i9FormRepository.findOne({ where: { owner: user_id } });
        const mmrFullForm = await mmrFullFormRepository.findOne({ where: { user_id } });
        const pneumococcalVaccinationFullForm = await pneumococcalVaccinationFullFormRepository.findOne({
            where: { user_id },
        });
        const tuberculosisFullForm = await tuberculosisFullFormRepository.findOne({
            where: { owner: user_id },
        });
        const varicellaFullForm = await varicellaFullFormRepository.findOne({
            where: { user_id },
        });
        const referenceForm = await referenceFormRepository.findOne({ where: { user_id } });
        const cjisFullForm = await cjisFullFormRepository.findOne({ where: { user_id } });
        const formsData = {};
        if (!userBioData) {
            formsData['userBioDataForm'] = userBioData;
        }
        if (!employeeDemographicInformation) {
            formsData['employeeDemographicForm'] = {
                employeeDemographicInformation,
            };
        }
        if (!fluFullForm) {
            formsData['fluForm'] = {
                fluFullForm,
            };
        }
        if (!hepatitisBFullForm) {
            formsData['hepatitisBForm'] = {
                hepatitisBFullForm,
            };
        }
        if (!i9Form) {
            formsData['i9Form'] = {
                i9Form,
            };
        }
        if (!mmrFullForm) {
            formsData['mmrForm'] = {
                mmrFullForm,
            };
        }
        if (!pneumococcalVaccinationFullForm) {
            formsData['pneumococcalForm'] = {
                pneumococcalVaccinationFullForm,
            };
        }
        if (!tuberculosisFullForm) {
            formsData['tuberculosisForm'] = {
                tuberculosisFullForm,
            };
        }
        if (!varicellaFullForm) {
            formsData['varicellaForm'] = {
                varicellaFullForm,
            };
        }
        if (!referenceForm) {
            formsData['referenceForm'] = referenceForm;
        }
        if (!cjisFullForm) {
            formsData['cjisForm'] = {
                cjisFullForm,
            };
        }
        return res.customSuccess(200, 'User and form data successfully retrieved.', {
            user,
            formsData,
            total: Object.keys(formsData).length,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fetchUserNotFilledForms = fetchUserNotFilledForms;
//# sourceMappingURL=fetchNotStartedForms.js.map