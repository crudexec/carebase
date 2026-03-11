type Form = {
  data?: any;
};

const isFieldCompleted = (field: any): number => (field ? 1 : 0);

const calculateCompletedSections = (sections: any[]): number => {
  return sections.reduce((acc, curr) => acc + isFieldCompleted(curr), 0);
};

const calculatePercentage = (
  completedSections: number,
  totalSections: number
): string => {
  return Math.floor((completedSections / totalSections) * 100).toString();
};

const isFormValid = (form: any): boolean => {
  return form && typeof form === "object" && Object.keys(form).length > 0;
};

export const calculateBiodataProgress = (form: Form,admin:boolean): string => {
  return form?.data?.created_at ? "100" : "0";
};

export const calculateReferenceProgress = (form: Form,admin:boolean): string => {
  const totalFormFields = 12;

  const completedField = [
    form?.data?.referrer_one_firstname,
    form?.data?.referrer_one_lastname,
    form?.data?.referrer_one_email,
    form?.data?.referrer_one_phone,

    form?.data?.referrer_two_firstname,
    form?.data?.referrer_two_lastname,
    form?.data?.referrer_two_email,
    form?.data?.referrer_two_phone,

    form?.data?.referrer_three_firstname,
    form?.data?.referrer_three_lastname,
    form?.data?.referrer_three_email,
    form?.data?.referrer_three_phone,
  ];

  const completedSections = calculateCompletedSections(completedField);
  return calculatePercentage(completedSections, totalFormFields);
};

export const calculateI9Progress = (form: Form, admin: boolean): string => {
  if (!isFormValid(form)) return "0";
  const totalSections = 4;

  if (form?.data && typeof form?.data === "object") {
    const sections = [
      form?.data?.i9Form?.filled_pdf_json_data?.length > 0,
      form?.data?.i9Form?.filled_pdf_json_data?.length > 0,
      form?.data?.documents[0]?.created_at ||
        Object.keys(form?.data?.documents).length > 0,
      form?.data?.signature?.created_at,
    ];

    const completedSections = calculateCompletedSections(sections);
    return calculatePercentage(completedSections, totalSections);
  }

  return "0";
};

export const calculateEmployeeDemographicProgress = (form: Form,admin:boolean): string => {
  if (!isFormValid(form)) return "0";
  const totalSections = 3;

  if (form?.data && typeof form?.data === "object") {
    const sections = [
      form?.data?.employeeDemographicInformation?.created_at,
      form?.data?.emergencyContactInformation?.created_at,
      form?.data?.employeeDemographicInformation?.created_at &&
        form?.data?.emergencyContactInformation?.created_at,
    ];
    const completedSections = calculateCompletedSections(sections);
    return calculatePercentage(completedSections, totalSections);
  }

  return "0";
};

export const calculateTbFormProgress = (form: Form, admin: boolean): string => {
  if (!isFormValid(form)) return "0";
  const totalSections = 2;

  if (form?.data && typeof form?.data === "object") {
    const sections = admin
      ? [
          form?.data?.tuberculosisMantouxForm?.created_at,
          form?.data?.tuberculosisSignatureForm?.created_at,
        ]
      : [
          form?.data?.tuberculosisMantouxRiskAssessmentForm?.created_at,
          form?.data?.tuberculosisSignatureForm?.created_at,
        ];
    const completedSections = calculateCompletedSections(sections);
    return calculatePercentage(completedSections, totalSections);
  }

  return "0";
};

export const calculatePneumococcalVaccinationProgress = (
  form: Form,
  admin: boolean
): string => {
  if (!isFormValid(form)) return "0";
  const totalSections = 3;

  if (form?.data && typeof form?.data === "object") {
    const sections = [
      form?.data?.employeeInformation?.created_at,
      form?.data?.pneumococcalVaccinationForm?.created_at,
      admin
        ? form?.data?.pneumococcalSignatureForm?.created_at
        : form?.data?.signature?.created_at,
    ];
    const completedSections = calculateCompletedSections(sections);
    return calculatePercentage(completedSections, totalSections);
  }

  return "0";
};

export const calculateHepatitisVaccinationProgress = (
  form: Form,
  admin: boolean
): string => {
  if (!isFormValid(form)) return "0";
  const totalSections = 3;

  if (form?.data && typeof form?.data === "object") {
    const sections = [
      admin
        ? form?.data?.hepatitisBAttestationForm?.created_at
        : form?.data?.attestationInformation?.created_at,
      admin
        ? form?.data?.personalInformationHepatitisBForm?.created_at
        : form?.data?.personalInformation?.created_at,
      admin
        ? form?.data?.hepatitisBSignatureForm?.created_at
        : form?.data?.signatureInformation?.created_at,
    ];
    const completedSections = calculateCompletedSections(sections);
    return calculatePercentage(completedSections, totalSections);
  }

  return "0";
};

export const calculateVaricellaVaccineProgress = (form: Form,admin:boolean): string => {
  if (!isFormValid(form)) return "0";
  const totalSections = 3;

  if (form?.data && typeof form?.data === "object") {
    const sections = [
      form?.data?.varicellaAttestationForm?.created_at,
      form?.data?.varicellaEmployeeInformation?.created_at,
      form?.data?.varicellaSignatureForm?.created_at,
    ];
    const completedSections = calculateCompletedSections(sections);
    return calculatePercentage(completedSections, totalSections);
  }

  return "0";
};

export const calculateMmrVaccineProgress = (form: Form,admin:boolean): string => {
  if (!isFormValid(form)) return "0";
  const totalSections = 3;

  if (form?.data && typeof form?.data === "object") {
    const sections = [
      form?.data?.mmrAttestationForm?.created_at,
      form?.data?.mmrEmployeeInformation?.created_at,
      form?.data?.mmrSignatureForm?.created_at,
    ];
    const completedSections = calculateCompletedSections(sections);
    return calculatePercentage(completedSections, totalSections);
  }

  return "0";
};

export const calculateFluVaccineProgress = (form: Form,admin:boolean): string => {
  if (!isFormValid(form)) return "0";
  const totalSections = 3;

  if (form?.data && typeof form?.data === "object") {
    const sections = [
      form?.data?.fluEmployeeInformation?.created_at,
      form?.data?.fluAttestationForm?.created_at,
      form?.data?.fluSignatureForm?.created_at,
    ];
    const completedSections = calculateCompletedSections(sections);
    return calculatePercentage(completedSections, totalSections);
  }

  return "0";
};

export const calculateCJISFormProgress = (
  form: Form,
  admin: boolean
): string => {
  if (!isFormValid(form)) return "0";
  let totalSections = 2;

  if (admin) {
    if (form?.data && typeof form?.data === "object") {
      const sections = [
        form?.data?.cjisEmployeeInformation?.created_at,
        form?.data?.cjisSignatureForm?.created_at,
      ];
      const completedSections = calculateCompletedSections(sections);
      return calculatePercentage(completedSections, totalSections);
    }

    return "0";
  }

  if (form?.data && typeof form?.data === "object") {
    if (form?.data?.preRegistrationForm?.created_at) {
      totalSections = 3;
    }
    const sections = [
      form?.data?.employeeInformation?.created_at,
      form?.data?.signatureForm?.created_at,
      form?.data?.preRegistrationForm?.created_at,
    ];
    const completedSections = calculateCompletedSections(sections);
    return calculatePercentage(completedSections, totalSections);
  }

  return "0";
};
