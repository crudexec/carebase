"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserApprovedForms = void 0;
const lodash_1 = require("lodash");
const typeorm_1 = require("typeorm");
const cjisEmployeeInformation_1 = require("orm/entities/CJISForm/cjisEmployeeInformation");
const cjisFullForm_1 = require("orm/entities/CJISForm/cjisFullForm");
const cjisPreRegistration_1 = require("orm/entities/CJISForm/cjisPreRegistration");
const cjisSignature_1 = require("orm/entities/CJISForm/cjisSignature");
const emergencyDemographicForm_1 = require("orm/entities/EmployeeDemographicForm/emergencyDemographicForm");
const personalInformation_1 = require("orm/entities/EmployeeDemographicForm/personalInformation");
const fluFullForm_1 = require("orm/entities/FluForm/fluFullForm");
const fluSignatureForm_1 = require("orm/entities/FluForm/fluSignatureForm");
const personalInformation_2 = require("orm/entities/FluForm/personalInformation");
const vaccineAttestationForm_1 = require("orm/entities/FluForm/vaccineAttestationForm");
const attestationForm_1 = require("orm/entities/HepatitisBForm/attestationForm");
const HepatitisFullForm_1 = require("orm/entities/HepatitisBForm/HepatitisFullForm");
const personalInformation_3 = require("orm/entities/HepatitisBForm/personalInformation");
const signatureForm_1 = require("orm/entities/HepatitisBForm/signatureForm");
const citizenship_1 = require("orm/entities/i9Form/citizenship");
const document_1 = require("orm/entities/i9Form/document");
const i9form_1 = require("orm/entities/i9Form/i9form");
const personalInformation_4 = require("orm/entities/i9Form/personalInformation");
const signature_1 = require("orm/entities/i9Form/signature");
const declinationInfluenzaForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/declinationInfluenzaForm");
const influenzaDeclinationFullForm_1 = require("orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm");
const personalInformation_5 = require("orm/entities/InfluenzaVaccineDeclinationForm/personalInformation");
const signatureForm_2 = require("orm/entities/InfluenzaVaccineDeclinationForm/signatureForm");
const mmrAttestationForm_1 = require("orm/entities/MMRVaccineForm/mmrAttestationForm");
const mmrFullForm_1 = require("orm/entities/MMRVaccineForm/mmrFullForm");
const mmrSignatureForm_1 = require("orm/entities/MMRVaccineForm/mmrSignatureForm");
const personalInformation_6 = require("orm/entities/MMRVaccineForm/personalInformation");
const attestationForm_2 = require("orm/entities/N95Form/attestationForm");
const n95FullForm_1 = require("orm/entities/N95Form/n95FullForm");
const signatureForm_3 = require("orm/entities/N95Form/signatureForm");
const employeeInformationForm_1 = require("orm/entities/PneumoccalVaccinationForm/employeeInformationForm");
const pneumoccalSignature_1 = require("orm/entities/PneumoccalVaccinationForm/pneumoccalSignature");
const pneumococcalFullForm_1 = require("orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm");
const pneumococcalVaccinationForm_1 = require("orm/entities/PneumoccalVaccinationForm/pneumococcalVaccinationForm");
const reference_1 = require("orm/entities/ReferenceForm/reference");
const ppdAdministrationForm_1 = require("orm/entities/Tuberculosis-MantouxForm/ppdAdministrationForm");
const tuberculosisFormSignature_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisFormSignature");
const tuberculosisFullForm_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm");
const tuberculosisTestingForm_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisTestingForm");
const types_1 = require("orm/entities/types");
const User_1 = require("orm/entities/User");
const userBioData_1 = require("orm/entities/userBioData");
const personalInformation_7 = require("orm/entities/VaricellaVaccineForm/personalInformation");
const varicellaAttestation_1 = require("orm/entities/VaricellaVaccineForm/varicellaAttestation");
const varicellaFullForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaFullForm");
const varicellaSignatureForm_1 = require("orm/entities/VaricellaVaccineForm/varicellaSignatureForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fetchUserApprovedForms = async (req, res, next) => {
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const user_id = req.params.id;
    const userBioDataRepository = (0, typeorm_1.getRepository)(userBioData_1.UserBioData);
    const emergencyContactInformationRepository = (0, typeorm_1.getRepository)(emergencyDemographicForm_1.EmergencyContactInformation);
    const employeeDemographicRepository = (0, typeorm_1.getRepository)(personalInformation_1.EmployeePersonalInformation);
    const fluSignatureFormRepository = (0, typeorm_1.getRepository)(fluSignatureForm_1.FluSignatureForm);
    const fluFullFormRepository = (0, typeorm_1.getRepository)(fluFullForm_1.FluFullForm);
    const fluAttestationFormRepository = (0, typeorm_1.getRepository)(vaccineAttestationForm_1.FluAttestationForm);
    const fluEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_2.FluEmployeeInformation);
    const hepatitisBAttestationFormRepository = (0, typeorm_1.getRepository)(attestationForm_1.HepatitisBAttestationForm);
    const hepatitisBFullFormRepository = (0, typeorm_1.getRepository)(HepatitisFullForm_1.HepatitisBFullForm);
    const personalInformationHepatitisBFormRepository = (0, typeorm_1.getRepository)(personalInformation_3.PersonalInformationHepatitisBForm);
    const hepatitisBSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_1.HepatitisBSignatureForm);
    const citizenshipFormRepository = (0, typeorm_1.getRepository)(citizenship_1.CitizenshipForm);
    const documentsRepository = (0, typeorm_1.getRepository)(document_1.Documents);
    const i9FormRepository = (0, typeorm_1.getRepository)(i9form_1.I9Form);
    const personalInformationRepository = (0, typeorm_1.getRepository)(personalInformation_4.PersonalInformation);
    const signatureRepository = (0, typeorm_1.getRepository)(signature_1.Signature);
    const influenzaEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_5.InfluenzaEmployeeInformation);
    const influenzaVaccinationDeclinationFormRepository = (0, typeorm_1.getRepository)(declinationInfluenzaForm_1.InfluenzaVaccinationDeclinationForm);
    const influenzaSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_2.InfluenzaSignatureForm);
    const influenzaVaccinationDeclinationFullFormRepository = (0, typeorm_1.getRepository)(influenzaDeclinationFullForm_1.InfluenzaVaccinationDeclinationFullForm);
    const mmrFullFormRepository = (0, typeorm_1.getRepository)(mmrFullForm_1.MMRFullForm);
    const mmrSignatureFormRepository = (0, typeorm_1.getRepository)(mmrSignatureForm_1.MMRSignatureForm);
    const mmrAttestationFormRepository = (0, typeorm_1.getRepository)(mmrAttestationForm_1.MMRAttestationForm);
    const mmrEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_6.MMREmployeeInformation);
    const n95FitSignatureFormRepository = (0, typeorm_1.getRepository)(signatureForm_3.N95FitSignatureForm);
    const n95FitFullFormRepository = (0, typeorm_1.getRepository)(n95FullForm_1.N95FitFullForm);
    const n95FitAttestationFormRepository = (0, typeorm_1.getRepository)(attestationForm_2.N95FitAttestationForm);
    const employeeInformationRepository = (0, typeorm_1.getRepository)(employeeInformationForm_1.EmployeeInformation);
    const pneumococcalSignatureFormRepository = (0, typeorm_1.getRepository)(pneumoccalSignature_1.PneumococcalSignatureForm);
    const pneumococcalVaccinationFullFormRepository = (0, typeorm_1.getRepository)(pneumococcalFullForm_1.PneumococcalVaccinationFullForm);
    const pneumococcalVaccinationFormRepository = (0, typeorm_1.getRepository)(pneumococcalVaccinationForm_1.PneumococcalVaccinationForm);
    const ppdAdministrationFormRepository = (0, typeorm_1.getRepository)(ppdAdministrationForm_1.PpdAdministrationForm);
    const tuberculosisSignatureFormRepository = (0, typeorm_1.getRepository)(tuberculosisFormSignature_1.TuberculosisSignatureForm);
    const tuberculosisFullFormRepository = (0, typeorm_1.getRepository)(tuberculosisFullForm_1.TuberculosisFullForm);
    const tuberculosisMantouxFormRepository = (0, typeorm_1.getRepository)(tuberculosisTestingForm_1.TuberculosisMantouxForm);
    const varicellaSignatureFormRepository = (0, typeorm_1.getRepository)(varicellaSignatureForm_1.VaricellaSignatureForm);
    const varicellaFullFormRepository = (0, typeorm_1.getRepository)(varicellaFullForm_1.VaricellaFullForm);
    const varicellaAttestationFormRepository = (0, typeorm_1.getRepository)(varicellaAttestation_1.VaricellaAttestationForm);
    const varicellaEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_7.VaricellaEmployeeInformation);
    const referenceFormRepository = (0, typeorm_1.getRepository)(reference_1.ReferenceForm);
    const cjisFullFormRepository = (0, typeorm_1.getRepository)(cjisFullForm_1.CJISFullForm);
    const cjisEmployeeInformationRepository = (0, typeorm_1.getRepository)(cjisEmployeeInformation_1.CJISEmployeeInformation);
    const cjisSignatureFormRepository = (0, typeorm_1.getRepository)(cjisSignature_1.CJISSignatureForm);
    const cjisPreRegistrationFormRepository = (0, typeorm_1.getRepository)(cjisPreRegistration_1.CJISPreRegistrationForm);
    try {
        const user = await userRepository.findOne({ where: { id: user_id, role: types_1.Role.STANDARD } });
        const userBioData = await userBioDataRepository.findOne({ where: { user_id: user_id, status: genericEnums_1.Status.APPROVED } });
        const emergencyContactInformation = await emergencyContactInformationRepository.findOne({ where: { user_id } });
        const employeeDemographicInformation = (await employeeDemographicRepository.findOne({
            where: { user_id, status: genericEnums_1.Status.APPROVED },
        })) || { status: genericEnums_1.Status.AWAITING_APPROVAL };
        const fluFullForm = (await fluFullFormRepository.findOne({ where: { user_id, status: genericEnums_1.Status.APPROVED } })) || {
            status: genericEnums_1.Status.AWAITING_APPROVAL,
        };
        const fluEmployeeInformation = await fluEmployeeInformationRepository.findOne({ where: { user_id } });
        const fluAttestationForm = await fluAttestationFormRepository.findOne({ where: { user_id } });
        const fluSignatureForm = await fluSignatureFormRepository.findOne({ where: { signed_by: user_id } });
        const hepatitisBAttestationForm = await hepatitisBAttestationFormRepository.findOne({ where: { user_id } });
        const hepatitisBFullForm = (await hepatitisBFullFormRepository.findOne({
            where: { user_id, status: genericEnums_1.Status.APPROVED },
        })) || { status: genericEnums_1.Status.AWAITING_APPROVAL };
        const personalInformationHepatitisBForm = await personalInformationHepatitisBFormRepository.findOne({
            where: { user_id },
        });
        const hepatitisBSignatureForm = await hepatitisBSignatureFormRepository.findOne({ where: { signed_by: user_id } });
        const citizenshipForm = await citizenshipFormRepository.findOne({ where: { owner: user_id } });
        const documents = await documentsRepository.findOne({ where: { owner: user_id } });
        const i9Form = (await i9FormRepository.findOne({ where: { owner: user_id, status: genericEnums_1.Status.APPROVED } })) || {
            status: genericEnums_1.Status.AWAITING_APPROVAL,
        };
        const personalInformation = await personalInformationRepository.findOne({ where: { user_id } });
        const signature = await signatureRepository.findOne({ where: { signed_by: user_id } });
        const mmrFullForm = (await mmrFullFormRepository.findOne({ where: { user_id, status: genericEnums_1.Status.APPROVED } })) || {
            status: genericEnums_1.Status.AWAITING_APPROVAL,
        };
        const mmrSignatureForm = await mmrSignatureFormRepository.findOne({ where: { signed_by: user_id } });
        const mmrAttestationForm = await mmrAttestationFormRepository.findOne({ where: { user_id } });
        const mmrEmployeeInformation = await mmrEmployeeInformationRepository.findOne({ where: { user_id } });
        const n95FitSignatureForm = await n95FitSignatureFormRepository.findOne({ where: { signed_by: user_id } });
        const n95FitFullForm = (await n95FitFullFormRepository.findOne({
            where: { user_id, status: genericEnums_1.Status.APPROVED },
        })) || { status: genericEnums_1.Status.AWAITING_APPROVAL };
        const n95FitAttestationForm = await n95FitAttestationFormRepository.findOne({ where: { user_id } });
        const employeeInformation = await employeeInformationRepository.findOne({ where: { user_id } });
        const pneumococcalSignatureForm = await pneumococcalSignatureFormRepository.findOne({
            where: { signed_by: user_id },
        });
        const pneumococcalVaccinationFullForm = (await pneumococcalVaccinationFullFormRepository.findOne({
            where: { user_id, status: genericEnums_1.Status.APPROVED },
        })) || { status: genericEnums_1.Status.AWAITING_APPROVAL };
        const pneumococcalVaccinationForm = await pneumococcalVaccinationFormRepository.findOne({ where: { user_id } });
        const ppdAdministrationForm = await ppdAdministrationFormRepository.findOne({ where: { user_id } });
        const tuberculosisSignatureForm = await tuberculosisSignatureFormRepository.findOne({
            where: { signed_by: user_id },
        });
        const tuberculosisFullForm = (await tuberculosisFullFormRepository.findOne({
            where: { owner: user_id, status: genericEnums_1.Status.APPROVED },
        })) || { status: genericEnums_1.Status.AWAITING_APPROVAL };
        const tuberculosisMantouxForm = await tuberculosisMantouxFormRepository.findOne({ where: { owner: user_id } });
        const varicellaSignatureForm = await varicellaSignatureFormRepository.findOne({ where: { signed_by: user_id } });
        const varicellaFullForm = (await varicellaFullFormRepository.findOne({
            where: { user_id, status: genericEnums_1.Status.APPROVED },
        })) || { status: genericEnums_1.Status.AWAITING_APPROVAL };
        const varicellaAttestationForm = await varicellaAttestationFormRepository.findOne({ where: { user_id } });
        const varicellaEmployeeInformation = await varicellaEmployeeInformationRepository.findOne({ where: { user_id } });
        const referenceForm = await referenceFormRepository.findOne({ where: { user_id, status: genericEnums_1.Status.APPROVED } });
        const cjisFullForm = await cjisFullFormRepository.findOne({ where: { user_id, status: genericEnums_1.Status.APPROVED } });
        const cjisEmployeeInformation = await cjisEmployeeInformationRepository.findOne({ where: { user_id } });
        const cjisSignatureForm = await cjisSignatureFormRepository.findOne({ where: { signed_by: user_id } });
        const cjisPreRegistrationForm = await cjisPreRegistrationFormRepository.findOne({ where: { user_id } });
        const formsData = {};
        if (!(0, lodash_1.isEmpty)(userBioData)) {
            formsData['userBioDataForm'] = userBioData;
        }
        if (!(0, lodash_1.isEmpty)(emergencyContactInformation) && employeeDemographicInformation.status === genericEnums_1.Status.APPROVED) {
            formsData['employeeDemographicForm'] = {
                emergencyContactInformation,
                employeeDemographicInformation,
            };
        }
        if (!(0, lodash_1.isEmpty)(fluFullForm) && fluFullForm.status === genericEnums_1.Status.APPROVED) {
            formsData['fluForm'] = {
                fluFullForm,
                fluEmployeeInformation,
                fluAttestationForm,
                fluSignatureForm,
            };
        }
        if (!(0, lodash_1.isEmpty)(hepatitisBFullForm) && hepatitisBFullForm.status === genericEnums_1.Status.APPROVED) {
            formsData['hepatitisBForm'] = {
                hepatitisBAttestationForm,
                hepatitisBFullForm,
                personalInformationHepatitisBForm,
                hepatitisBSignatureForm,
            };
        }
        if (!(0, lodash_1.isEmpty)(i9Form) && i9Form.status === genericEnums_1.Status.APPROVED) {
            formsData['i9Form'] = {
                citizenshipForm,
                documents,
                i9Form,
                personalInformation,
                signature,
            };
        }
        if (!(0, lodash_1.isEmpty)(mmrFullForm) && mmrFullForm.status === genericEnums_1.Status.APPROVED) {
            formsData['mmrForm'] = {
                mmrFullForm,
                mmrSignatureForm,
                mmrAttestationForm,
                mmrEmployeeInformation,
            };
        }
        if (!(0, lodash_1.isEmpty)(pneumococcalVaccinationFullForm) && pneumococcalVaccinationFullForm.status === genericEnums_1.Status.APPROVED) {
            formsData['pneumococcalForm'] = {
                employeeInformation,
                pneumococcalSignatureForm,
                pneumococcalVaccinationFullForm,
                pneumococcalVaccinationForm,
            };
        }
        if (!(0, lodash_1.isEmpty)(tuberculosisFullForm) && tuberculosisFullForm.status === genericEnums_1.Status.APPROVED) {
            formsData['tuberculosisForm'] = {
                ppdAdministrationForm,
                tuberculosisSignatureForm,
                tuberculosisFullForm,
                tuberculosisMantouxForm,
            };
        }
        if (!(0, lodash_1.isEmpty)(varicellaFullForm) && varicellaFullForm.status === genericEnums_1.Status.APPROVED) {
            formsData['varicellaForm'] = {
                varicellaSignatureForm,
                varicellaFullForm,
                varicellaAttestationForm,
                varicellaEmployeeInformation,
            };
        }
        if (!(0, lodash_1.isEmpty)(referenceForm)) {
            formsData['referenceForm'] = referenceForm;
        }
        if (!(0, lodash_1.isEmpty)(cjisFullForm) && cjisFullForm.status === genericEnums_1.Status.APPROVED) {
            formsData['cjisForm'] = {
                cjisFullForm,
                cjisEmployeeInformation,
                cjisSignatureForm,
                cjisPreRegistrationForm,
            };
        }
        return res.customSuccess(200, 'User and form data successfully retrieved.', {
            user,
            formsData,
            total: Object.keys(formsData).length,
        });
    }
    catch (err) {
        console.log('Error', err);
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fetchUserApprovedForms = fetchUserApprovedForms;
//# sourceMappingURL=fetchUserApprovedForms.js.map