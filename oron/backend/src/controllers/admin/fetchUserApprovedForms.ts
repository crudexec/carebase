import { Request, Response, NextFunction } from 'express';
import { isEmpty } from 'lodash';
import { getRepository } from 'typeorm';

import { CJISEmployeeInformation } from 'orm/entities/CJISForm/cjisEmployeeInformation';
import { CJISFullForm } from 'orm/entities/CJISForm/cjisFullForm';
import { CJISPreRegistrationForm } from 'orm/entities/CJISForm/cjisPreRegistration';
import { CJISSignatureForm } from 'orm/entities/CJISForm/cjisSignature';
import { EmergencyContactInformation } from 'orm/entities/EmployeeDemographicForm/emergencyDemographicForm';
import { EmployeePersonalInformation } from 'orm/entities/EmployeeDemographicForm/personalInformation';
import { FluFullForm } from 'orm/entities/FluForm/fluFullForm';
import { FluSignatureForm } from 'orm/entities/FluForm/fluSignatureForm';
import { FluEmployeeInformation } from 'orm/entities/FluForm/personalInformation';
import { FluAttestationForm } from 'orm/entities/FluForm/vaccineAttestationForm';
import { HepatitisBAttestationForm } from 'orm/entities/HepatitisBForm/attestationForm';
import { HepatitisBFullForm } from 'orm/entities/HepatitisBForm/HepatitisFullForm';
import { PersonalInformationHepatitisBForm } from 'orm/entities/HepatitisBForm/personalInformation';
import { HepatitisBSignatureForm } from 'orm/entities/HepatitisBForm/signatureForm';
import { CitizenshipForm } from 'orm/entities/i9Form/citizenship';
import { Documents } from 'orm/entities/i9Form/document';
import { I9Form } from 'orm/entities/i9Form/i9form';
import { PersonalInformation } from 'orm/entities/i9Form/personalInformation';
import { Signature } from 'orm/entities/i9Form/signature';
import { InfluenzaVaccinationDeclinationForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/declinationInfluenzaForm';
import { InfluenzaVaccinationDeclinationFullForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/influenzaDeclinationFullForm';
import { InfluenzaEmployeeInformation } from 'orm/entities/InfluenzaVaccineDeclinationForm/personalInformation';
import { InfluenzaSignatureForm } from 'orm/entities/InfluenzaVaccineDeclinationForm/signatureForm';
import { MMRAttestationForm } from 'orm/entities/MMRVaccineForm/mmrAttestationForm';
import { MMRFullForm } from 'orm/entities/MMRVaccineForm/mmrFullForm';
import { MMRSignatureForm } from 'orm/entities/MMRVaccineForm/mmrSignatureForm';
import { MMREmployeeInformation } from 'orm/entities/MMRVaccineForm/personalInformation';
import { N95FitAttestationForm } from 'orm/entities/N95Form/attestationForm';
import { N95FitFullForm } from 'orm/entities/N95Form/n95FullForm';
import { N95FitSignatureForm } from 'orm/entities/N95Form/signatureForm';
import { EmployeeInformation } from 'orm/entities/PneumoccalVaccinationForm/employeeInformationForm';
import { PneumococcalSignatureForm } from 'orm/entities/PneumoccalVaccinationForm/pneumoccalSignature';
import { PneumococcalVaccinationFullForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm';
import { PneumococcalVaccinationForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalVaccinationForm';
import { ReferenceForm } from 'orm/entities/ReferenceForm/reference';
import { PpdAdministrationForm } from 'orm/entities/Tuberculosis-MantouxForm/ppdAdministrationForm';
import { TuberculosisSignatureForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFormSignature';
import { TuberculosisFullForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm';
import { TuberculosisMantouxForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisTestingForm';
import { Role } from 'orm/entities/types';
import { User } from 'orm/entities/User';
import { UserBioData } from 'orm/entities/userBioData';
import { VaricellaEmployeeInformation } from 'orm/entities/VaricellaVaccineForm/personalInformation';
import { VaricellaAttestationForm } from 'orm/entities/VaricellaVaccineForm/varicellaAttestation';
import { VaricellaFullForm } from 'orm/entities/VaricellaVaccineForm/varicellaFullForm';
import { VaricellaSignatureForm } from 'orm/entities/VaricellaVaccineForm/varicellaSignatureForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const fetchUserApprovedForms = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const userRepository = getRepository(User);
  const user_id = req.params.id;
  const userBioDataRepository = getRepository(UserBioData);
  const emergencyContactInformationRepository = getRepository(EmergencyContactInformation);
  const employeeDemographicRepository = getRepository(EmployeePersonalInformation);
  const fluSignatureFormRepository = getRepository(FluSignatureForm);
  const fluFullFormRepository = getRepository(FluFullForm);
  const fluAttestationFormRepository = getRepository(FluAttestationForm);
  const fluEmployeeInformationRepository = getRepository(FluEmployeeInformation);
  const hepatitisBAttestationFormRepository = getRepository(HepatitisBAttestationForm);
  const hepatitisBFullFormRepository = getRepository(HepatitisBFullForm);
  const personalInformationHepatitisBFormRepository = getRepository(PersonalInformationHepatitisBForm);
  const hepatitisBSignatureFormRepository = getRepository(HepatitisBSignatureForm);
  const citizenshipFormRepository = getRepository(CitizenshipForm);
  const documentsRepository = getRepository(Documents);
  const i9FormRepository = getRepository(I9Form);
  const personalInformationRepository = getRepository(PersonalInformation);
  const signatureRepository = getRepository(Signature);
  const influenzaEmployeeInformationRepository = getRepository(InfluenzaEmployeeInformation);
  const influenzaVaccinationDeclinationFormRepository = getRepository(InfluenzaVaccinationDeclinationForm);
  const influenzaSignatureFormRepository = getRepository(InfluenzaSignatureForm);
  const influenzaVaccinationDeclinationFullFormRepository = getRepository(InfluenzaVaccinationDeclinationFullForm);
  const mmrFullFormRepository = getRepository(MMRFullForm);
  const mmrSignatureFormRepository = getRepository(MMRSignatureForm);
  const mmrAttestationFormRepository = getRepository(MMRAttestationForm);
  const mmrEmployeeInformationRepository = getRepository(MMREmployeeInformation);
  const n95FitSignatureFormRepository = getRepository(N95FitSignatureForm);
  const n95FitFullFormRepository = getRepository(N95FitFullForm);
  const n95FitAttestationFormRepository = getRepository(N95FitAttestationForm);
  const employeeInformationRepository = getRepository(EmployeeInformation);
  const pneumococcalSignatureFormRepository = getRepository(PneumococcalSignatureForm);
  const pneumococcalVaccinationFullFormRepository = getRepository(PneumococcalVaccinationFullForm);
  const pneumococcalVaccinationFormRepository = getRepository(PneumococcalVaccinationForm);
  const ppdAdministrationFormRepository = getRepository(PpdAdministrationForm);
  const tuberculosisSignatureFormRepository = getRepository(TuberculosisSignatureForm);
  const tuberculosisFullFormRepository = getRepository(TuberculosisFullForm);
  const tuberculosisMantouxFormRepository = getRepository(TuberculosisMantouxForm);
  const varicellaSignatureFormRepository = getRepository(VaricellaSignatureForm);
  const varicellaFullFormRepository = getRepository(VaricellaFullForm);
  const varicellaAttestationFormRepository = getRepository(VaricellaAttestationForm);
  const varicellaEmployeeInformationRepository = getRepository(VaricellaEmployeeInformation);
  const referenceFormRepository = getRepository(ReferenceForm);
  const cjisFullFormRepository = getRepository(CJISFullForm);
  const cjisEmployeeInformationRepository = getRepository(CJISEmployeeInformation);
  const cjisSignatureFormRepository = getRepository(CJISSignatureForm);
  const cjisPreRegistrationFormRepository = getRepository(CJISPreRegistrationForm);

  try {
    const user = await userRepository.findOne({ where: { id: user_id, role: Role.STANDARD } });

    const userBioData = await userBioDataRepository.findOne({ where: { user_id: user_id, status: Status.APPROVED } });

    const emergencyContactInformation = await emergencyContactInformationRepository.findOne({ where: { user_id } });
    const employeeDemographicInformation = (await employeeDemographicRepository.findOne({
      where: { user_id, status: Status.APPROVED },
    })) || { status: Status.AWAITING_APPROVAL };
    const fluFullForm = (await fluFullFormRepository.findOne({ where: { user_id, status: Status.APPROVED } })) || {
      status: Status.AWAITING_APPROVAL,
    };
    const fluEmployeeInformation = await fluEmployeeInformationRepository.findOne({ where: { user_id } });
    const fluAttestationForm = await fluAttestationFormRepository.findOne({ where: { user_id } });
    const fluSignatureForm = await fluSignatureFormRepository.findOne({ where: { signed_by: user_id } });
    const hepatitisBAttestationForm = await hepatitisBAttestationFormRepository.findOne({ where: { user_id } });
    const hepatitisBFullForm = (await hepatitisBFullFormRepository.findOne({
      where: { user_id, status: Status.APPROVED },
    })) || { status: Status.AWAITING_APPROVAL };
    const personalInformationHepatitisBForm = await personalInformationHepatitisBFormRepository.findOne({
      where: { user_id },
    });
    const hepatitisBSignatureForm = await hepatitisBSignatureFormRepository.findOne({ where: { signed_by: user_id } });
    const citizenshipForm = await citizenshipFormRepository.findOne({ where: { owner: user_id } });
    const documents = await documentsRepository.findOne({ where: { owner: user_id } });
    const i9Form = (await i9FormRepository.findOne({ where: { owner: user_id, status: Status.APPROVED } })) || {
      status: Status.AWAITING_APPROVAL,
    };
    const personalInformation = await personalInformationRepository.findOne({ where: { user_id } });
    const signature = await signatureRepository.findOne({ where: { signed_by: user_id } });
    // const influenzaEmployeeInformation =
    //   (await influenzaEmployeeInformationRepository.findOne({ where: { user_id } })) ;
    // const influenzaVaccinationDeclinationForm =
    //   (await influenzaVaccinationDeclinationFormRepository.findOne({ where: { user_id } })) ;
    // const influenzaSignatureForm =
    //   (await influenzaSignatureFormRepository.findOne({ where: { signed_by: user_id } })) ;
    // const influenzaVaccinationDeclinationFullForm = (await influenzaVaccinationDeclinationFullFormRepository.findOne({
    //   where: { user_id, status: Status.APPROVED },
    // })) || { status: Status.AWAITING_APPROVAL };
    const mmrFullForm = (await mmrFullFormRepository.findOne({ where: { user_id, status: Status.APPROVED } })) || {
      status: Status.AWAITING_APPROVAL,
    };
    const mmrSignatureForm = await mmrSignatureFormRepository.findOne({ where: { signed_by: user_id } });
    const mmrAttestationForm = await mmrAttestationFormRepository.findOne({ where: { user_id } });
    const mmrEmployeeInformation = await mmrEmployeeInformationRepository.findOne({ where: { user_id } });
    const n95FitSignatureForm = await n95FitSignatureFormRepository.findOne({ where: { signed_by: user_id } });
    const n95FitFullForm = (await n95FitFullFormRepository.findOne({
      where: { user_id, status: Status.APPROVED },
    })) || { status: Status.AWAITING_APPROVAL };
    const n95FitAttestationForm = await n95FitAttestationFormRepository.findOne({ where: { user_id } });
    const employeeInformation = await employeeInformationRepository.findOne({ where: { user_id } });
    const pneumococcalSignatureForm = await pneumococcalSignatureFormRepository.findOne({
      where: { signed_by: user_id },
    });
    const pneumococcalVaccinationFullForm = (await pneumococcalVaccinationFullFormRepository.findOne({
      where: { user_id, status: Status.APPROVED },
    })) || { status: Status.AWAITING_APPROVAL };
    const pneumococcalVaccinationForm = await pneumococcalVaccinationFormRepository.findOne({ where: { user_id } });
    const ppdAdministrationForm = await ppdAdministrationFormRepository.findOne({ where: { user_id } });
    const tuberculosisSignatureForm = await tuberculosisSignatureFormRepository.findOne({
      where: { signed_by: user_id },
    });
    const tuberculosisFullForm = (await tuberculosisFullFormRepository.findOne({
      where: { owner: user_id, status: Status.APPROVED },
    })) || { status: Status.AWAITING_APPROVAL };
    const tuberculosisMantouxForm = await tuberculosisMantouxFormRepository.findOne({ where: { owner: user_id } });
    const varicellaSignatureForm = await varicellaSignatureFormRepository.findOne({ where: { signed_by: user_id } });
    const varicellaFullForm = (await varicellaFullFormRepository.findOne({
      where: { user_id, status: Status.APPROVED },
    })) || { status: Status.AWAITING_APPROVAL };
    const varicellaAttestationForm = await varicellaAttestationFormRepository.findOne({ where: { user_id } });
    const varicellaEmployeeInformation = await varicellaEmployeeInformationRepository.findOne({ where: { user_id } });

    const referenceForm = await referenceFormRepository.findOne({ where: { user_id, status: Status.APPROVED } });

    const cjisFullForm = await cjisFullFormRepository.findOne({ where: { user_id, status: Status.APPROVED } });

    const cjisEmployeeInformation = await cjisEmployeeInformationRepository.findOne({ where: { user_id } });

    const cjisSignatureForm = await cjisSignatureFormRepository.findOne({ where: { signed_by: user_id } });

    const cjisPreRegistrationForm = await cjisPreRegistrationFormRepository.findOne({ where: { user_id } });

    const formsData = {};

    if (!isEmpty(userBioData)) {
      formsData['userBioDataForm'] = userBioData;
    }
    if (!isEmpty(emergencyContactInformation) && employeeDemographicInformation.status === Status.APPROVED) {
      formsData['employeeDemographicForm'] = {
        emergencyContactInformation,
        employeeDemographicInformation,
      };
    }

    if (!isEmpty(fluFullForm) && fluFullForm.status === Status.APPROVED) {
      formsData['fluForm'] = {
        fluFullForm,
        fluEmployeeInformation,
        fluAttestationForm,
        fluSignatureForm,
      };
    }

    if (!isEmpty(hepatitisBFullForm) && hepatitisBFullForm.status === Status.APPROVED) {
      formsData['hepatitisBForm'] = {
        hepatitisBAttestationForm,
        hepatitisBFullForm,
        personalInformationHepatitisBForm,
        hepatitisBSignatureForm,
      };
    }

    if (!isEmpty(i9Form) && i9Form.status === Status.APPROVED) {
      formsData['i9Form'] = {
        citizenshipForm,
        documents,
        i9Form,
        personalInformation,
        signature,
      };
    }

    // if (
    //   !isEmpty(influenzaVaccinationDeclinationFullForm) &&
    //   influenzaVaccinationDeclinationFullForm.status === Status.APPROVED
    // ) {
    //   formsData['influenzaForm'] = {
    //     influenzaEmployeeInformation,
    //     influenzaVaccinationDeclinationForm,
    //     influenzaSignatureForm,
    //     influenzaVaccinationDeclinationFullForm,
    //   };
    // }

    if (!isEmpty(mmrFullForm) && mmrFullForm.status === Status.APPROVED) {
      formsData['mmrForm'] = {
        mmrFullForm,
        mmrSignatureForm,
        mmrAttestationForm,
        mmrEmployeeInformation,
      };
    }

    // if (!isEmpty(n95FitFullForm) && n95FitFullForm.status === Status.APPROVED) {
    //   formsData['n95Form'] = {
    //     n95FitSignatureForm,
    //     n95FitFullForm,
    //     n95FitAttestationForm,
    //   };
    // }

    if (!isEmpty(pneumococcalVaccinationFullForm) && pneumococcalVaccinationFullForm.status === Status.APPROVED) {
      formsData['pneumococcalForm'] = {
        employeeInformation,
        pneumococcalSignatureForm,
        pneumococcalVaccinationFullForm,
        pneumococcalVaccinationForm,
      };
    }

    if (!isEmpty(tuberculosisFullForm) && tuberculosisFullForm.status === Status.APPROVED) {
      formsData['tuberculosisForm'] = {
        ppdAdministrationForm,
        tuberculosisSignatureForm,
        tuberculosisFullForm,
        tuberculosisMantouxForm,
      };
    }

    if (!isEmpty(varicellaFullForm) && varicellaFullForm.status === Status.APPROVED) {
      formsData['varicellaForm'] = {
        varicellaSignatureForm,
        varicellaFullForm,
        varicellaAttestationForm,
        varicellaEmployeeInformation,
      };
    }

    if (!isEmpty(referenceForm)) {
      formsData['referenceForm'] = referenceForm;
    }

    if (!isEmpty(cjisFullForm) && cjisFullForm.status === Status.APPROVED) {
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
  } catch (err) {
    console.log('Error', err);
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
