import { Prisma, Provider } from "@prisma/client";

export type UserResponse = Prisma.UserGetPayload<{
  include: {
    image: true;
    UserProvider: {
      select: {
        provider: true;
        providerId: true;
      };
    };
  };
}> &
  Partial<{
    providers: Provider[];
    accessToken: string;
    refreshToken: string;
    provider: Provider;
    providerId: string;
    role: string;
  }>;

export type PatientMedicationResponse = Prisma.PatientMedicationGetPayload<{
  include: {
    serviceRequested: true;
    primaryDx: true;
    medication: true;
    MIO12InpatientProcedure: true;
  };
}>;

export type UserHistoryResponse = Prisma.UserHistoryGetPayload<{
  include: {
    media: true;
    caregiverCertifications: true;
    professionalLicense: true;
    driversLicense: true;
  };
}>;

export type UserListResponse = Prisma.UserGetPayload<{
  include: {
    image: true;
    group: true;
    userHistory: {
      include: {
        media: true;
        caregiverCertifications: true;
        professionalLicense: true;
        driversLicense: true;
      };
    };
  };
}>;

export type PatientResponse = Prisma.PatientGetPayload<{
  include: {
    physician: true;
    patientAdmission: {
      include: { actionBy: true; daysPerEpisode: true };
    };
    patientAccessInformation: {
      include: { patient: true };
    };
    patientAuthorization: true;
    patientPolicyHolder: true;
    patientCommercial: true;
    patientEmergencyContact: true;
    patientInsurance: true;
    patientReferralSource: {
      include: {
        pharmacy: true;
      };
    };
    patientMedication: {
      include: {
        serviceRequested: true;
        primaryDx: true;
        medication: true;
        MIO12InpatientProcedure: true;
      };
    };
    provider: true;
  };
}>;

export type PatientAdmissionResponse = Prisma.PatientAdmissionGetPayload<{
  include: {
    patient: true;
    actionBy: true;
  };
}>;

export type PatientReferralSourceResponse =
  Prisma.PatientReferralSourceGetPayload<{
    include: {
      pharmacy: true;
    };
  }>;
export type PatientAccessInfoResponse =
  Prisma.PatientAccessInformationGetPayload<{
    include: {
      patient: true;
    };
  }>;

export type TaxonomyResponse = Prisma.TaxonomyGetPayload<{
  include: {
    codes: true;
  };
}>;
export type PatientScheduleResponse = Prisma.PatientScheduleGetPayload<{
  include: {
    patient: {
      include: { patientAdmission: true };
    };
    Assessment: true;
    caregiver: true;
    scheduleRecurrence: true;
    scheduleVisitVerification: {
      include: {
        signature: true;
      };
    };
    Consent: true;
  };
}>;
export type ScheduleVerificationResponse =
  Prisma.ScheduleVisitVerificationGetPayload<{
    include: {
      signature: true;
      patientSchedule: {
        include: {
          patient: {
            include: {
              patientAdmission: true;
            };
          };
        };
      };
    };
  }>;

export type PatientFrequencyResponse = Prisma.PatientFrequencyGetPayload<{
  include: {
    discipline: true;
  };
}>;
export type PatientInsuranceResponse = Prisma.PatientInsuranceGetPayload<{
  include: {
    payer: true;
    insuranceCaseManager: true;
    relatedCaregiver: true;
  };
}>;

export type PatientOtherInfoResponse = Prisma.PatientOtherInfoGetPayload<{
  include: {
    otherPhysician: true;
  };
}>;

export type UnscheduledVisitResponse = Prisma.UnscheduledVisitGetPayload<{
  include: {
    patientSignature: true;
    caregiverSignature: true;
    caregiver: true;
    skilledNursingNote: true;
    patient: {
      include: {
        patientMedication: true;
        patientAdmission: true;
      };
    };
  };
}>;

export type PriorAuthorizationResponse =
  Prisma.InsurancePriorAuthorizationGetPayload<{
    include: {
      patientInsurance: true;
      discipline: true;
    };
  }>;

export type VitalSignsResponse = Prisma.VitalSignsGetPayload<{
  include: {
    skilledNursingNote: {
      include: {
        caregiver: true;
      };
    };
  };
}>;

export type SkinAndWoundResponse = Prisma.SkinAndWoundGetPayload<{
  include: {
    woundcare: true;
  };
}>;

export type SkilledNursingNoteResponse = Prisma.SkilledNursingNoteGetPayload<{
  include: {
    patient: {
      include: {
        patientAdmission: true;
      };
    };
    caregiver: true;
    unscheduledVisit: {
      include: {
        patientSignature: true;
        caregiverSignature: true;
      };
    };
    vitalSigns: true;
    cardioPulm: true;
    neuroGastro: true;
    genitoEndo: true;
    noteMedication: true;
    notePlan: true;
    qASignature: true;
    skinAndWound: {
      include: {
        woundcare: true;
      };
    };
    noteIntervention: true;
    noteIntervInst: true;
  };
}>;

export type PlanOfCareResponse = Prisma.PlanOfCareGetPayload<{
  include: {
    patient: {
      include: {
        patientAdmission: true;
      };
    };
    caregiver: true;
    physician: true;
    qASignature: true;
    ordersAndGoals: true;
    planOfCareDiagnosis: true;
    planOfCareProcedure: true;
  };
}>;

export type OrdersAndGoalsResponse = Prisma.OrdersAndGoalsGetPayload<{
  include: {
    discipline: true;
  };
}>;
export type PocDiagnosisProcedureResponse =
  Prisma.PocDiagnosisProcedureGetPayload<{
    include: {
      diagnosisProcedure: true;
    };
  }>;

export type AssessmentResponse = Prisma.AssessmentGetPayload<{
  include: {
    patient: true;
    patientSchedule: { include: { patient: true } };
    caregiver: true;
    nurse: true;
    oasisAssessment: true;
    patientTracking: true;
    historyAndDiagnosis: true;
  };
}>;
