import statesData from "@/data/states.json";
import treatmentPlanData from "@/data/treatment.json";
import behaviour from "@/data/behaviour.json";
import countriesData from "@/data/countries.json";
import { FormTableContainer } from "@/components/forms/Columns";

export const TB_FORM_SIDEBAR = [
  {
    id: 1,
    name: "Risk Assessment",
  },
  {
    id: 2,
    name: "Review & Sign",
  },
];

export const PNEUMOCOCCAL_FORM_SIDEBAR = [
  {
    id: 1,
    name: "Employee Information",
  },
  {
    id: 2,
    name: "Vaccination Information",
  },
  {
    id: 3,
    name: "Review & Sign",
  },
];

export const HEPATITIS_ATTESTATION_FORM_SIDEBAR = [
  {
    id: 1,
    name: "Attestation",
  },
  {
    id: 2,
    name: "Information",
  },
  {
    id: 3,
    name: "Review And Sign",
  },
];

export const MMR_FORM_SIDEBAR = [
  {
    id: 1,
    name: "Attestation",
  },
  {
    id: 2,
    name: "Review And Sign",
  },
];

export const FLU_VACCINE_FORM_SIDEBAR = [
  {
    id: 1,
    name: "Employee Information",
  },
  {
    id: 2,
    name: "Vaccine Information",
  },
  {
    id: 3,
    name: "Review & Sign",
  },
];

export const DECLINATION_INFLUENZA_FORM_SIDEBAR = [
  {
    id: 1,
    name: "Form",
  },
  {
    id: 2,
    name: "Employee Information",
  },
  {
    id: 3,
    name: "Signature",
  },
];

export const FIT_ATTESTATION_FORM_SIDEBAR = [
  {
    id: 1,
    name: "Form",
  },
  {
    id: 2,
    name: "Signature",
  },
];

export const CLIENTS_FORM_SIDEBAR = [
  {
    id: 1,
    name: "Participant",
  },
  {
    id: 2,
    name: "Referral",
  },
  {
    id: 3,
    name: "Intake",
  },
  {
    id: 4,
    name: "Contact",
  },
  {
    id: 5,
    name: "Service Co-ordinators",
  },
  {
    id: 6,
    name: "More About Client",
  },
  {
    id: 7,
    name: "Medical",
  },
  {
    id: 8,
    name: "Admission",
  },
];

export const INSTRUCTIONS = [
  {
    id: 1,
    title: "Fill the i-9 form with your correct information",
    description:
      "Please fill in your information correctly on the form and ensure that you fill it out completely.",
    image: "/assets/images/inine/step-one.png",
  },
  // {
  //   id: 2,
  //   title: "Download the Completely filled form",
  //   description:
  //     "You will need to download the fully completed form because you will have to re-upload it.",
  //   image: "/assets/images/inine/step-two.png",
  // },
  {
    id: 2,
    title: "Move between sections easily",
    description: "Please upload the form after completing all fields.",
    image: "/assets/images/inine/step-three.png",
  },

  {
    id: 3,
    title: "Sign Right Here",
    description:
      "You can sign right here by drawing your signature with your mouse or touchscreen. Once you've signed, you can submit your form for approval.",
    image: "/assets/images/dashboard/instructions3.svg",
  },
];

export const EMPTY_USER = {
  message: "",
  data: {
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    created_at: "",
  },
};

export const STATES: { label: string; value: string }[] = JSON.parse(
  JSON.stringify(statesData)
);

export const COUNTRIES: { label: string; value: string }[] = JSON.parse(
  JSON.stringify(countriesData)
);

export interface GoalsData {
  [key: string]: {
    [key: string]: {
      [key: string]: string[];
    };
  };
}
export const goalsData: GoalsData = JSON.parse(
  JSON.stringify(treatmentPlanData)
);

export const behaviour_type = JSON.parse(JSON.stringify(behaviour));

export const GOAL_STATUS = [
  "Primary goal",
  "Secondary goal",
  "Mastered goal",
  "Goal on hold",
  "Discontinued goal",
  "Remove from PDF",
];

export const CURRENT_SKILL = [
  "Hand over Hand",
  "Physical Prompts",
  "Model Prompts",
  "Gesture Prompts",
  "Visual Cue",
  "Verbal Prompts",
  "Intermittent Verbal Prompts",
  "Independence",
  "Refused",
  "Unable",
];
export const NUMBER_OF_FORMS = 11;

export const FORMS: FormTableContainer[] = [
  {
    id: "biodata",
    formName: "Bio-data Form",
    progress: 0,
    started: "",
    submittedDate: "",
    status: "Not Filled",
    route: "/onboarding/form/biodata",
    formId: "",
  },
  {
    id: "refForm",
    formName: "Reference Form",
    progress: 0,
    started: "",
    submittedDate: "",
    status: "Not Filled",
    route: "/onboarding/form/reference-form",
  },
  {
    id: "i9",
    formName: "i - 9 Form",
    progress: 0,
    started: "",
    submittedDate: "",
    status: "Not Filled",
    route: "/onboarding/form/i9form",
    formId: "",
  },
  {
    id: "tbForm",
    formName: "Tuberculosis Screening",
    progress: 0,
    started: "",
    submittedDate: "",
    status: "Not Filled",
    route: "/onboarding/form/tbform",
    formId: "",
  },
  {
    id: "employeeDemographic",
    formName: "Employee Demographic Form",
    progress: 0,
    started: "",
    submittedDate: "",
    status: "Not Filled",
    route: "/onboarding/form/employee-demographic-form",
    formId: "",
  },
  {
    id: "pneumococcalVaccination",
    formName: "Pneumococcal Vaccination Form",
    progress: 0,
    started: "",
    submittedDate: "",
    status: "Not Filled",
    route: "/onboarding/form/pneumococcal-vaccination-form",
    formId: "",
  },
  {
    id: "hepatitisVaccination",
    formName: "Hepatitis B Vaccination Attestation",
    progress: 0,
    started: "",
    submittedDate: "",
    status: "Not Filled",
    route: "/onboarding/form/hepatitis-vaccine-attestation-form",
    formId: "",
  },
  {
    id: "varicellaVaccine",
    formName: "Varicella Vaccine Attestation Form",
    progress: 0,
    started: "",
    submittedDate: "",
    status: "Not Filled",
    route: "/onboarding/form/varicella-vaccine-attestation-form",
    formId: "",
  },
  {
    id: "mmrVaccine",
    formName: "MMR Vaccine Attestation",
    progress: 0,
    started: "",
    submittedDate: "",
    status: "Not Filled",
    route: "/onboarding/form/mmr-vaccine-attestation-form",
    formId: "",
  },
  {
    id: "fluVaccine",
    formName: "Flu Vaccine Attestation and Declination",
    progress: 0,
    started: "",
    submittedDate: "",
    status: "Not Filled",
    route: "/onboarding/form/flu-vaccine-attestation-declination-form",
    formId: "",
  },
  {
    id: "cjisAttestation",
    formName: "CJIS Attestation",
    progress: 0,
    started: "",
    submittedDate: "",
    status: "Not Filled",
    route: "/onboarding/form/cjis-form",
    formId: "",
  },
];

export const INVALID_SSN_MESSAGE = "Invalid Social Security Number";

export const MAX_SSSN_MESSAGE =
  "Social Security Cannot Be More Than Nine Characters";

export const INCOMPLETE_FIELD_MESSAGE = "Please complete all required fields.";
export const BASE_LINE = [
  "Hand over Hand",
  "Physical Prompts",
  "Model Prompts",
  "Gesture Prompts",
  "Visual Cue",
  "Verbal Prompts",
  "Intermittent Verbal Prompts",
  "Independence",
  "Refused",
  "Unable",
];

export const LEVEL_OF_COMPLIANCE = [
  "Seemed distant/ distracted",
  "Seemed mostly annoyed and/or combative",
  "Seemed mostly silly and/or overactive",
  "Seemed willing to participate",
  "Seemed eager to participate",
];

export const VISITING_INVENTS = [
  "No Events",
  "1 - 3",
  "4 - 7",
  "7 - 20",
  "20+",
];

export const VISTING_ANTECEDENT = [
  "Physical ailments",
  "Overstimulation",
  "Change in routine",
  "Transition",
  "Lack of attention",
  "Demand/ directive",
  "Difficulty communicating a need/want",
  "Denied access/ told “no”",
  "Previous incident",
  "Denied food request",
  "Changes or reduction in medication(s)",
  "Blocked from aggression or self-injury",
  "Environment",
  "Medication",
  "Toileting accidents or issues",
  "Unknown",
];
export const VISITING_CONSEQUENCES = [
  "Withholding privileges",
  "Corrective strategies",
  "Negative reinforcement",
  "Consequences",
  "Providing alternatives",
  "Providing prompting",
  "Proximity",
  "Response cost",
  "Sensory-based intervention",
  "Providing physical intervention",
  "Not exclusion",
  "Minimal attention",
];

export const VISITING_SETTINGS = [
  "Day/Time/Periods",
  "Subjects/Activities",
  "Group Size",
  "Location",
];

export const VISITING_SEVERITY = ["High", "Average", "Mild"];

export const OTHER_CRISIS_INTERVENTION = ["Verbal redirection", "Blocking"];

export const WHERE_ACTIVITY = ["Home", "Community", "Through telehealth"];

export const ANTECEDENT_LEADING_TO_ACTIVITY = [
  "During meal/ snack time",
  "During domestic training time",
  "During project work/ reading",
  "During leisure time",
  "During personal care",
  "During bowel and bladder movement",
  "During socialization and community integration",
  "During routine task",
  "During transition",
  "When choice was given",
  "When instruction/ directive was given",
  "When told “no”",
  "When there was close proximity",
  "When I paid attention to others",
  "When there was a loud noise",
  "Other",
];

export const PROMPT_USED = [
  "Hand over head",
  "Physical prompts",
  "Model prompts",
  "Gesture prompts",
  "Visual cue",
  "Verbal prompts",
  "Intermittent verbal prompts",
  "Independence",
  "Refused",
  "Unable",
];

export const CLIENT_RESPONSE = [
  "Being cooperative",
  "Being responsive",
  "Showing eagerness to participate",
  "Intensifying the situation",
  "Yelling, crying, and moving away",
  "Engaging in self-stimulation",
  "Leaving the area",
  "Taking a short nap",
  "Being apologetic",
  "Showing remorse",
  "Refusing to follow instructions",
  "Being defiant",
  "Being unresponsive",
  "Being anxious",
  "Being angry",
  "Being agitated",
  "Being distracted",
  "Being irritated",
  "Showing a flat affect",
  "Being withdrawn",
  "Being sad",
  "Being calm",
  "Other",
];

export const CONSEQUENCES_CLIENT = [
  "Was rewarded",
  "Was not rewarded",
  "Was redirected",
  "Was given another chance",
  "Had me discuss behaviour",
  "Was given personal space",
  "Was asked to participate in another activity",
  "Received peer attention",
  "Was verbally praised",
  "Was verbally reprimanded",
  "Was physically prompted",
  "Other",
];

export const CLIENT_REWARD = [
  "Good job",
  "High- 5",
  "Computer",
  "Tokens",
  "Movie",
  "Cookies",
  "Hugs",
  "Ice cream",
  "Chips",
  "Other",
];

export const NUMBER_OF_TIMES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
];

export const VISITING_FORM_THREE = {
  activityPracticed: ["Home", "Community", "Through telehealth"],
  circumstances: [
    "During meal/ snack time",
    "During domestic training time",
    "During project work/ reading",
    "During leisure time",
    "During personal care",
    "During bowel and bladder movement",
    "During socialization and community integration",
    "During routine task",
    "During transition",
    "When choice was given",
    "When instruction/ directive was given",
    "When told “no”",
    "When there was close proximity",
    "When I paid attention to others",
    "When there was a loud noise",
    "Other",
  ],
  response: [
    "Being cooperative",
    "Being responsive",
    "Showing eagerness to participate",
    "Intensifying the situation",
    "Yelling, crying, and moving away",
    "Engaging in self-stimulation",
    "Leaving the area",
    "Taking a short nap",
    "Being apologetic",
    "Showing remorse",
    "Refusing to follow instructions",
    "Being defiant",
    "Being unresponsive",
    "Being anxious",
    "Being angry",
    "Being agitated",
    "Being distracted",
    "Being irritated",
    "Showing a flat affect",
    "Being withdrawn",
    "Being sad",
    "Being calm",
    "Other",
  ],
  consequently: [
    "Was rewarded",
    "Was not rewarded",
    "Was redirected",
    "Was given another chance",
    "Had me discuss behaviour",
    "Was given personal space",
    "Was asked to participate in another activity",
    "Received peer attention",
    "Was verbally praised",
    "Was verbally reprimanded",
    "Was physically prompted",
    "Other",
    "Good job",
    "High- 5",
    "Computer",
    "Tokens",
    "Movie",
    "Cookies",
    "Hugs",
    "Ice cream",
    "Chips",
    "Other",
  ],
  reward: [
    "Good job",
    "High- 5",
    "Computer",
    "Tokens",
    "Movie",
    "Cookies",
    "Hugs",
    "Ice cream",
    "Chips",
    "Other",
  ],
};

export const CJIS_DOCUMENT_URL: string =
  "https://minio-oooo808gg008www4sgw4kkk8.15.204.240.209.sslip.io/orondocs/Livescan%20Pre-Registration%20App%20for%20DSP.pdf"

export const EMPLOYEE_HANDBOOK_DOCUMENT_URL: string =
  "https://minio-oooo808gg008www4sgw4kkk8.15.204.240.209.sslip.io/orondocs/1717224722647-Employee%20Handbook.pdf";

export const API_BASE_URL: string =
  process.env.BASE_URL! ?? process.env.NEXT_PUBLIC_BASE_URL!;
