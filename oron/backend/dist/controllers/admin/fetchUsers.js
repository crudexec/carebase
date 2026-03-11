"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUsers = void 0;
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
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fetchUsers = async (req, res, next) => {
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
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
    const size = Number(req.query.size) || 5;
    const page = Number(req.query.page) || 1;
    const roleFilter = req.query.role;
    try {
        let whereClause = {};
        if (roleFilter === 'all') {
            whereClause = {};
        }
        else if (roleFilter === 'CLIENT_MANAGER') {
            whereClause = { role: types_1.Role.CLIENT_MANAGER };
        }
        else if (roleFilter === 'ADMINISTRATOR') {
            whereClause = { role: types_1.Role.ADMINISTRATOR };
        }
        else if (roleFilter === 'EMPLOYEE_MANAGER') {
            whereClause = { role: types_1.Role.EMPLOYEE_MANAGER };
        }
        else {
            whereClause = { role: types_1.Role.STANDARD };
        }
        const [users, total] = await userRepository.findAndCount({
            where: whereClause,
            order: { created_at: 'DESC' },
            skip: (page - 1) * size,
            take: size,
        });
        const usersData = [];
        let userDump = {};
        if (users.length === 0) {
            return res.customSuccess(200, 'No users found.', []);
        }
        if (users.length > 0) {
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const userBioData = await userBioDataRepository.findOne({
                    where: { user_id: user.id },
                });
                const employeeDemographicInformation = await employeeDemographicRepository.findOne({
                    where: { user_id: user.id },
                });
                const fluFullForm = await fluFullFormRepository.findOne({ where: { user_id: user.id } });
                const hepatitisBFullForm = await hepatitisBFullFormRepository.findOne({
                    where: { user_id: user.id },
                });
                const i9Form = await i9FormRepository.findOne({ where: { owner: user.id } });
                const mmrFullForm = await mmrFullFormRepository.findOne({ where: { user_id: user.id } });
                const pneumococcalVaccinationFullForm = await pneumococcalVaccinationFullFormRepository.findOne({
                    where: { user_id: user.id },
                });
                const tuberculosisFullForm = await tuberculosisFullFormRepository.findOne({ where: { owner: user.id } });
                const varicellaFullForm = await varicellaFullFormRepository.findOne({ where: { user_id: user.id } });
                const referenceForm = await referenceFormRepository.findOne({ where: { user_id: user.id } });
                const cjisFullForm = await cjisFullFormRepository.findOne({ where: { user_id: user.id } });
                const awaitingApprovalForm = {};
                const formsData = {};
                const approvedForms = {};
                const inprogressForms = {};
                userBioData?.status === genericEnums_1.Status.IN_PROGRESS ? (inprogressForms['userBioData'] = userBioData) : null;
                employeeDemographicInformation?.status === genericEnums_1.Status.IN_PROGRESS
                    ? (inprogressForms['employeeDemographicInformation'] = employeeDemographicInformation)
                    : null;
                fluFullForm?.status === genericEnums_1.Status.IN_PROGRESS ? (inprogressForms['fluFullForm'] = fluFullForm) : null;
                hepatitisBFullForm?.status === genericEnums_1.Status.IN_PROGRESS
                    ? (inprogressForms['hepatitisBFullForm'] = hepatitisBFullForm)
                    : null;
                i9Form?.status === genericEnums_1.Status.IN_PROGRESS ? (inprogressForms['i9Form'] = i9Form) : null;
                mmrFullForm?.status === genericEnums_1.Status.IN_PROGRESS ? (inprogressForms['mmrFullForm'] = mmrFullForm) : null;
                pneumococcalVaccinationFullForm?.status === genericEnums_1.Status.IN_PROGRESS
                    ? (inprogressForms['pneumococcalVaccinationFullForm'] = pneumococcalVaccinationFullForm)
                    : null;
                tuberculosisFullForm?.status === genericEnums_1.Status.IN_PROGRESS
                    ? (inprogressForms['tuberculosisFullForm'] = tuberculosisFullForm)
                    : null;
                varicellaFullForm?.status === genericEnums_1.Status.IN_PROGRESS
                    ? (inprogressForms['varicellaFullForm'] = varicellaFullForm)
                    : null;
                referenceForm?.status === genericEnums_1.Status.IN_PROGRESS ? (inprogressForms['referenceForm'] = referenceForm) : null;
                cjisFullForm?.status === genericEnums_1.Status.IN_PROGRESS ? (inprogressForms['cjisFullForm'] = cjisFullForm) : null;
                userBioData?.status === genericEnums_1.Status.APPROVED ? (approvedForms['userBioData'] = userBioData) : null;
                employeeDemographicInformation?.status === genericEnums_1.Status.APPROVED
                    ? (approvedForms['employeeDemographicInformation'] = employeeDemographicInformation)
                    : null;
                fluFullForm?.status === genericEnums_1.Status.APPROVED ? (approvedForms['fluFullForm'] = fluFullForm) : null;
                hepatitisBFullForm?.status === genericEnums_1.Status.APPROVED
                    ? (approvedForms['hepatitisBFullForm'] = hepatitisBFullForm)
                    : null;
                i9Form?.status === genericEnums_1.Status.APPROVED ? (approvedForms['i9Form'] = i9Form) : null;
                mmrFullForm?.status === genericEnums_1.Status.APPROVED ? (approvedForms['mmrFullForm'] = mmrFullForm) : null;
                pneumococcalVaccinationFullForm?.status === genericEnums_1.Status.APPROVED
                    ? (approvedForms['pneumococcalVaccinationFullForm'] = pneumococcalVaccinationFullForm)
                    : null;
                tuberculosisFullForm?.status === genericEnums_1.Status.APPROVED
                    ? (approvedForms['tuberculosisFullForm'] = tuberculosisFullForm)
                    : null;
                varicellaFullForm?.status === genericEnums_1.Status.APPROVED ? (approvedForms['varicellaFullForm'] = varicellaFullForm) : null;
                referenceForm?.status === genericEnums_1.Status.APPROVED ? (approvedForms['referenceForm'] = referenceForm) : null;
                cjisFullForm?.status === genericEnums_1.Status.APPROVED ? (approvedForms['cjisFullForm'] = cjisFullForm) : null;
                userBioData?.status === genericEnums_1.Status.AWAITING_APPROVAL ? (awaitingApprovalForm['userBioData'] = userBioData) : null;
                employeeDemographicInformation?.status === genericEnums_1.Status.AWAITING_APPROVAL
                    ? (awaitingApprovalForm['employeeDemographicInformation'] = employeeDemographicInformation)
                    : null;
                fluFullForm?.status === genericEnums_1.Status.AWAITING_APPROVAL ? (awaitingApprovalForm['fluFullForm'] = fluFullForm) : null;
                hepatitisBFullForm?.status === genericEnums_1.Status.AWAITING_APPROVAL
                    ? (awaitingApprovalForm['hepatitisBFullForm'] = hepatitisBFullForm)
                    : null;
                i9Form?.status === genericEnums_1.Status.AWAITING_APPROVAL ? (awaitingApprovalForm['i9Form'] = i9Form) : null;
                mmrFullForm?.status === genericEnums_1.Status.AWAITING_APPROVAL ? (awaitingApprovalForm['mmrFullForm'] = mmrFullForm) : null;
                pneumococcalVaccinationFullForm?.status === genericEnums_1.Status.AWAITING_APPROVAL
                    ? (awaitingApprovalForm['pneumococcalVaccinationFullForm'] = pneumococcalVaccinationFullForm)
                    : null;
                tuberculosisFullForm?.status === genericEnums_1.Status.AWAITING_APPROVAL
                    ? (awaitingApprovalForm['tuberculosisFullForm'] = tuberculosisFullForm)
                    : null;
                varicellaFullForm?.status === genericEnums_1.Status.AWAITING_APPROVAL
                    ? (awaitingApprovalForm['varicellaFullForm'] = varicellaFullForm)
                    : null;
                referenceForm?.status === genericEnums_1.Status.AWAITING_APPROVAL
                    ? (awaitingApprovalForm['referenceForm'] = referenceForm)
                    : null;
                cjisFullForm?.status === genericEnums_1.Status.AWAITING_APPROVAL
                    ? (awaitingApprovalForm['cjisFullForm'] = cjisFullForm)
                    : null;
                if (!userBioData) {
                    formsData['userBioData'] = userBioData;
                }
                if (!employeeDemographicInformation) {
                    formsData['employeeDemographicInformation'] = employeeDemographicInformation;
                }
                if (!fluFullForm) {
                    formsData['fluFullForm'] = fluFullForm;
                }
                if (!hepatitisBFullForm) {
                    formsData['hepatitisBFullForm'] = hepatitisBFullForm;
                }
                if (!i9Form) {
                    formsData['i9Form'] = i9Form;
                }
                if (!mmrFullForm) {
                    formsData['mmrFullForm'] = mmrFullForm;
                }
                if (!pneumococcalVaccinationFullForm) {
                    formsData['pneumococcalVaccinationFullForm'] = pneumococcalVaccinationFullForm;
                }
                if (!tuberculosisFullForm) {
                    formsData['tuberculosisFullForm'] = tuberculosisFullForm;
                }
                if (!varicellaFullForm) {
                    formsData['varicellaFullForm'] = varicellaFullForm;
                }
                if (!referenceForm) {
                    formsData['referenceForm'] = referenceForm;
                }
                if (!cjisFullForm) {
                    formsData['cjisFullForm'] = cjisFullForm;
                }
                userDump = {
                    ...user,
                    not_started: Object.keys(formsData).length,
                    awaiting_approval: Object.keys(awaitingApprovalForm).length,
                    approved: Object.keys(approvedForms).length,
                    in_progress: Object.keys(inprogressForms).length,
                };
                usersData.push(userDump);
            }
        }
        return res.customSuccess(200, 'Users successfully fetched.', { usersData, total, page, size });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fetchUsers = fetchUsers;
//# sourceMappingURL=fetchUsers.js.map