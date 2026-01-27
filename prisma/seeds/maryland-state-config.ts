/**
 * Maryland State Configuration Seed Data
 *
 * This file contains the seed data for Maryland Medicaid home care requirements including:
 * - State configuration (CFC program, EVV requirements)
 * - Assessment templates (Katz ADL, Lawton IADL, PHQ-9, Mini-Cog)
 * - Consent form templates
 */

import { PrismaClient, ScoringMethod, AssessmentSectionType, AssessmentResponseType, ConsentFormType } from "@prisma/client";

const prisma = new PrismaClient();

// Maryland State Configuration
const MARYLAND_STATE_CONFIG = {
  stateCode: "MD",
  stateName: "Maryland",
  isActive: true,
  medicaidProgramName: "Community First Choice (CFC)",
  medicaidPayerId: "77027", // Maryland Medicaid Payer ID
  evvRequired: true,
  evvVendor: "Sandata",
  assessmentFrequency: 365, // Annual reassessment
  requiredAssessments: ["KATZ_ADL", "LAWTON_IADL", "PHQ9", "MINI_COG"],
  authorizationRequired: true,
  maxAuthorizationDays: 365,
  reauthorizationLeadDays: 60,
  maxHoursPerDay: 16,
  maxHoursPerWeek: 80,
  requiredConsentForms: [
    "GENERAL_CONSENT",
    "HIPAA_AUTHORIZATION",
    "MEDICAID_ASSIGNMENT",
    "CLIENT_RIGHTS",
    "PRIVACY_PRACTICES",
    "ABUSE_NEGLECT_REPORTING",
    "GRIEVANCE_PROCEDURE",
    "FALL_RISK_ACKNOWLEDGEMENT",
    "EMERGENCY_TREATMENT",
  ] as ConsentFormType[],
  medicaidRequirements: {
    programType: "CFC",
    waivers: ["HCBS", "CO"],
    nurseAssessmentRequired: true,
    physicianOrderRequired: true,
    tbTestRequired: true,
    backgroundCheckRequired: true,
    trainingHoursRequired: 75,
    annualTrainingHours: 16,
  },
};

// Katz ADL Assessment Template
const KATZ_ADL_TEMPLATE = {
  name: "Katz Index of Independence in ADL",
  description: "Standard 6-item assessment of basic activities of daily living for Maryland CFC program",
  version: 1,
  isActive: true,
  isRequired: true,
  displayOrder: 1,
  scoringMethod: "SUM" as ScoringMethod,
  maxScore: 6,
  scoringThresholds: {
    independent: { min: 6, max: 6, label: "Independent", careLevel: "LOW" },
    moderateImpairment: { min: 3, max: 5, label: "Moderate Impairment", careLevel: "MEDIUM" },
    severeImpairment: { min: 0, max: 2, label: "Severe Functional Impairment", careLevel: "HIGH" },
  },
  sections: [
    {
      sectionType: "KATZ_ADL" as AssessmentSectionType,
      title: "Activities of Daily Living (ADL) Assessment",
      description: "Assess the client's ability to perform basic self-care activities independently",
      instructions: "For each activity, select the level that best describes the client's functional ability. Score 1 point for independence, 0 points for dependence.",
      displayOrder: 0,
      scoringMethod: "SUM" as ScoringMethod,
      maxScore: 6,
      items: [
        {
          code: "BATHING",
          question: "Bathing: Does the client need help with bathing?",
          description: "Ability to bathe self completely or needs help in bathing only a single part of the body",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 0,
          responseOptions: [
            { value: 1, label: "Independent: Bathes self completely or needs help bathing only a single part of body (e.g., back, genital area)" },
            { value: 0, label: "Dependent: Needs help bathing more than one part of body, getting in/out of tub, or does not bathe self" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "DRESSING",
          question: "Dressing: Does the client need help with dressing?",
          description: "Ability to get clothes from closets and drawers and put on clothes including underclothes and outer garments",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 1,
          responseOptions: [
            { value: 1, label: "Independent: Gets clothes and puts them on completely without help" },
            { value: 0, label: "Dependent: Needs help getting dressed or stays partly or completely undressed" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "TOILETING",
          question: "Toileting: Does the client need help with toileting?",
          description: "Ability to go to the toilet, get on/off, arrange clothes, clean genital area without help",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 2,
          responseOptions: [
            { value: 1, label: "Independent: Goes to toilet, gets on/off, arranges clothes, cleans genital area without help" },
            { value: 0, label: "Dependent: Needs help transferring to toilet, cleaning self, or uses bedpan or commode" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "TRANSFERRING",
          question: "Transferring: Does the client need help with transferring?",
          description: "Ability to move in/out of bed or chair unassisted",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 3,
          responseOptions: [
            { value: 1, label: "Independent: Moves in/out of bed or chair unassisted. Mechanical aids are acceptable" },
            { value: 0, label: "Dependent: Needs help moving from bed to chair or requires complete transfer" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "CONTINENCE",
          question: "Continence: Does the client have control over urination and bowel movement?",
          description: "Ability to control urination and bowel movement",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 4,
          responseOptions: [
            { value: 1, label: "Independent: Exercises complete self-control over urination and defecation" },
            { value: 0, label: "Dependent: Is partially or totally incontinent of bowel or bladder" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "FEEDING",
          question: "Feeding: Does the client need help with feeding?",
          description: "Ability to get food from plate into mouth without help",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 5,
          responseOptions: [
            { value: 1, label: "Independent: Gets food from plate into mouth without help. Meal prep may be done by another" },
            { value: 0, label: "Dependent: Needs partial or total help with feeding or requires parenteral feeding" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
      ],
    },
  ],
};

// Lawton IADL Assessment Template
const LAWTON_IADL_TEMPLATE = {
  name: "Lawton Instrumental Activities of Daily Living Scale",
  description: "8-item assessment of instrumental activities of daily living for Maryland CFC program",
  version: 1,
  isActive: true,
  isRequired: true,
  displayOrder: 2,
  scoringMethod: "SUM" as ScoringMethod,
  maxScore: 8,
  scoringThresholds: {
    highFunction: { min: 7, max: 8, label: "High Function", careLevel: "LOW" },
    moderateFunction: { min: 4, max: 6, label: "Moderate Function", careLevel: "MEDIUM" },
    lowFunction: { min: 0, max: 3, label: "Low Function", careLevel: "HIGH" },
  },
  sections: [
    {
      sectionType: "LAWTON_IADL" as AssessmentSectionType,
      title: "Instrumental Activities of Daily Living (IADL) Assessment",
      description: "Assess the client's ability to perform tasks needed to live independently in the community",
      instructions: "For each activity, select the highest level of functioning that applies. Score 1 for independent, 0 for needing assistance.",
      displayOrder: 0,
      scoringMethod: "SUM" as ScoringMethod,
      maxScore: 8,
      items: [
        {
          code: "TELEPHONE",
          question: "Ability to Use Telephone",
          description: "Can the client operate a telephone independently?",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 0,
          responseOptions: [
            { value: 1, label: "Operates telephone independently, including looking up numbers and dialing" },
            { value: 1, label: "Dials a few well-known numbers" },
            { value: 1, label: "Answers telephone but does not dial" },
            { value: 0, label: "Does not use telephone at all" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "SHOPPING",
          question: "Shopping",
          description: "Can the client shop for groceries and necessities?",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 1,
          responseOptions: [
            { value: 1, label: "Takes care of all shopping needs independently" },
            { value: 0, label: "Shops independently for small purchases" },
            { value: 0, label: "Needs to be accompanied on any shopping trip" },
            { value: 0, label: "Completely unable to shop" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "FOOD_PREP",
          question: "Food Preparation",
          description: "Can the client prepare meals independently?",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 2,
          responseOptions: [
            { value: 1, label: "Plans, prepares, and serves adequate meals independently" },
            { value: 0, label: "Prepares adequate meals if supplied with ingredients" },
            { value: 0, label: "Heats and serves prepared meals, or prepares meals but does not maintain adequate diet" },
            { value: 0, label: "Needs to have meals prepared and served" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "HOUSEKEEPING",
          question: "Housekeeping",
          description: "Can the client maintain the household?",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 3,
          responseOptions: [
            { value: 1, label: "Maintains house alone or with occasional assistance (e.g., heavy work)" },
            { value: 1, label: "Performs light daily tasks such as dishwashing and bed making" },
            { value: 1, label: "Performs light daily tasks but cannot maintain acceptable level of cleanliness" },
            { value: 0, label: "Needs help with all home maintenance tasks" },
            { value: 0, label: "Does not participate in any housekeeping tasks" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "LAUNDRY",
          question: "Laundry",
          description: "Can the client do personal laundry?",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 4,
          responseOptions: [
            { value: 1, label: "Does personal laundry completely" },
            { value: 1, label: "Launders small items - rinses socks, stockings, etc." },
            { value: 0, label: "All laundry must be done by others" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "TRANSPORTATION",
          question: "Mode of Transportation",
          description: "Can the client travel independently?",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 5,
          responseOptions: [
            { value: 1, label: "Travels independently on public transportation or drives own car" },
            { value: 1, label: "Arranges own travel via taxi, but does not otherwise use public transportation" },
            { value: 1, label: "Travels on public transportation when assisted or accompanied by another" },
            { value: 0, label: "Travel limited to taxi or automobile with assistance of another" },
            { value: 0, label: "Does not travel at all" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "MEDICATIONS",
          question: "Responsibility for Own Medications",
          description: "Can the client manage medications independently?",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 6,
          responseOptions: [
            { value: 1, label: "Is responsible for taking medication in correct dosages at correct time" },
            { value: 0, label: "Takes responsibility if medication is prepared in advance in separate dosages" },
            { value: 0, label: "Is not capable of dispensing own medication" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
        {
          code: "FINANCES",
          question: "Ability to Handle Finances",
          description: "Can the client manage financial matters?",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 7,
          responseOptions: [
            { value: 1, label: "Manages financial matters independently (budgets, writes checks, pays bills)" },
            { value: 1, label: "Manages day-to-day purchases, but needs help with banking and major purchases" },
            { value: 0, label: "Incapable of handling money" },
          ],
          scoreMapping: { "1": 1, "0": 0 },
        },
      ],
    },
  ],
};

// PHQ-9 Depression Screening Template
const PHQ9_TEMPLATE = {
  name: "Patient Health Questionnaire (PHQ-9)",
  description: "Standard 9-item depression screening for Maryland CFC program",
  version: 1,
  isActive: true,
  isRequired: true,
  displayOrder: 3,
  scoringMethod: "SUM" as ScoringMethod,
  maxScore: 27,
  scoringThresholds: {
    minimal: { min: 0, max: 4, label: "Minimal Depression", careLevel: "LOW" },
    mild: { min: 5, max: 9, label: "Mild Depression", careLevel: "LOW" },
    moderate: { min: 10, max: 14, label: "Moderate Depression", careLevel: "MEDIUM" },
    moderatelySevere: { min: 15, max: 19, label: "Moderately Severe Depression", careLevel: "MEDIUM" },
    severe: { min: 20, max: 27, label: "Severe Depression", careLevel: "HIGH" },
  },
  sections: [
    {
      sectionType: "PHQ9" as AssessmentSectionType,
      title: "Depression Screening (PHQ-9)",
      description: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
      instructions: "Read each question to the client and record their response. Total score determines severity.",
      displayOrder: 0,
      scoringMethod: "SUM" as ScoringMethod,
      maxScore: 27,
      items: [
        {
          code: "PHQ9_Q1",
          question: "Little interest or pleasure in doing things",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 0,
          responseOptions: [
            { value: 0, label: "Not at all" },
            { value: 1, label: "Several days" },
            { value: 2, label: "More than half the days" },
            { value: 3, label: "Nearly every day" },
          ],
          scoreMapping: { "0": 0, "1": 1, "2": 2, "3": 3 },
        },
        {
          code: "PHQ9_Q2",
          question: "Feeling down, depressed, or hopeless",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 1,
          responseOptions: [
            { value: 0, label: "Not at all" },
            { value: 1, label: "Several days" },
            { value: 2, label: "More than half the days" },
            { value: 3, label: "Nearly every day" },
          ],
          scoreMapping: { "0": 0, "1": 1, "2": 2, "3": 3 },
        },
        {
          code: "PHQ9_Q3",
          question: "Trouble falling or staying asleep, or sleeping too much",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 2,
          responseOptions: [
            { value: 0, label: "Not at all" },
            { value: 1, label: "Several days" },
            { value: 2, label: "More than half the days" },
            { value: 3, label: "Nearly every day" },
          ],
          scoreMapping: { "0": 0, "1": 1, "2": 2, "3": 3 },
        },
        {
          code: "PHQ9_Q4",
          question: "Feeling tired or having little energy",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 3,
          responseOptions: [
            { value: 0, label: "Not at all" },
            { value: 1, label: "Several days" },
            { value: 2, label: "More than half the days" },
            { value: 3, label: "Nearly every day" },
          ],
          scoreMapping: { "0": 0, "1": 1, "2": 2, "3": 3 },
        },
        {
          code: "PHQ9_Q5",
          question: "Poor appetite or overeating",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 4,
          responseOptions: [
            { value: 0, label: "Not at all" },
            { value: 1, label: "Several days" },
            { value: 2, label: "More than half the days" },
            { value: 3, label: "Nearly every day" },
          ],
          scoreMapping: { "0": 0, "1": 1, "2": 2, "3": 3 },
        },
        {
          code: "PHQ9_Q6",
          question: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 5,
          responseOptions: [
            { value: 0, label: "Not at all" },
            { value: 1, label: "Several days" },
            { value: 2, label: "More than half the days" },
            { value: 3, label: "Nearly every day" },
          ],
          scoreMapping: { "0": 0, "1": 1, "2": 2, "3": 3 },
        },
        {
          code: "PHQ9_Q7",
          question: "Trouble concentrating on things, such as reading the newspaper or watching television",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 6,
          responseOptions: [
            { value: 0, label: "Not at all" },
            { value: 1, label: "Several days" },
            { value: 2, label: "More than half the days" },
            { value: 3, label: "Nearly every day" },
          ],
          scoreMapping: { "0": 0, "1": 1, "2": 2, "3": 3 },
        },
        {
          code: "PHQ9_Q8",
          question: "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 7,
          responseOptions: [
            { value: 0, label: "Not at all" },
            { value: 1, label: "Several days" },
            { value: 2, label: "More than half the days" },
            { value: 3, label: "Nearly every day" },
          ],
          scoreMapping: { "0": 0, "1": 1, "2": 2, "3": 3 },
        },
        {
          code: "PHQ9_Q9",
          question: "Thoughts that you would be better off dead, or of hurting yourself in some way",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 8,
          responseOptions: [
            { value: 0, label: "Not at all" },
            { value: 1, label: "Several days" },
            { value: 2, label: "More than half the days" },
            { value: 3, label: "Nearly every day" },
          ],
          scoreMapping: { "0": 0, "1": 1, "2": 2, "3": 3 },
        },
        {
          code: "PHQ9_DIFFICULTY",
          question: "If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?",
          responseType: "SINGLE_CHOICE" as AssessmentResponseType,
          displayOrder: 9,
          isRequired: false,
          responseOptions: [
            { value: "not_difficult", label: "Not difficult at all" },
            { value: "somewhat", label: "Somewhat difficult" },
            { value: "very", label: "Very difficult" },
            { value: "extremely", label: "Extremely difficult" },
          ],
        },
      ],
    },
  ],
};

// Mini-Cog Dementia Screening Template
const MINI_COG_TEMPLATE = {
  name: "Mini-Cog Dementia Screening",
  description: "Brief cognitive assessment for dementia screening in Maryland CFC program",
  version: 1,
  isActive: true,
  isRequired: true,
  displayOrder: 4,
  scoringMethod: "CUSTOM" as ScoringMethod,
  maxScore: 5,
  scoringThresholds: {
    normal: { min: 3, max: 5, label: "Normal Cognitive Function", careLevel: "LOW" },
    possible: { min: 0, max: 2, label: "Possible Cognitive Impairment", careLevel: "MEDIUM" },
  },
  sections: [
    {
      sectionType: "MINI_COG" as AssessmentSectionType,
      title: "Mini-Cog Cognitive Screening",
      description: "A brief 3-minute screening tool for cognitive impairment",
      instructions: "Step 1: Say three words to the client and have them repeat. Step 2: Clock drawing. Step 3: Word recall.",
      displayOrder: 0,
      scoringMethod: "CUSTOM" as ScoringMethod,
      maxScore: 5,
      items: [
        {
          code: "WORD_LIST",
          question: "Select which word list you are using:",
          description: "Choose one of the standard word lists below",
          responseType: "SINGLE_CHOICE" as AssessmentResponseType,
          displayOrder: 0,
          isRequired: true,
          responseOptions: [
            { value: "list1", label: "Version 1: Banana, Sunrise, Chair" },
            { value: "list2", label: "Version 2: Leader, Season, Table" },
            { value: "list3", label: "Version 3: Village, Kitchen, Baby" },
            { value: "list4", label: "Version 4: River, Nation, Finger" },
            { value: "list5", label: "Version 5: Captain, Garden, Picture" },
            { value: "list6", label: "Version 6: Daughter, Heaven, Mountain" },
          ],
        },
        {
          code: "CLOCK_DRAW",
          question: "Clock Drawing Test (CDT) Score",
          description: "Ask the client to draw a clock showing 11:10. Score 0 (abnormal) or 2 (normal).",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 1,
          responseOptions: [
            { value: 0, label: "Abnormal: Clock does not show correct time or has errors in number placement" },
            { value: 2, label: "Normal: Clock shows correct time with numbers correctly placed" },
          ],
          scoreMapping: { "0": 0, "2": 2 },
        },
        {
          code: "WORD_RECALL",
          question: "Word Recall Score",
          description: "Ask the client to recall the three words from Step 1. Score 1 point for each word recalled correctly.",
          responseType: "SCALE" as AssessmentResponseType,
          displayOrder: 2,
          minValue: 0,
          maxValue: 3,
          responseOptions: [
            { value: 0, label: "0 words recalled" },
            { value: 1, label: "1 word recalled" },
            { value: 2, label: "2 words recalled" },
            { value: 3, label: "3 words recalled" },
          ],
          scoreMapping: { "0": 0, "1": 1, "2": 2, "3": 3 },
        },
        {
          code: "NOTES",
          question: "Additional observations or notes",
          description: "Document any relevant observations during the assessment",
          responseType: "TEXT" as AssessmentResponseType,
          displayOrder: 3,
          isRequired: false,
        },
      ],
    },
  ],
};

// Consent Form Templates for Maryland
const CONSENT_FORM_TEMPLATES = [
  {
    name: "General Consent for Services",
    formType: "GENERAL_CONSENT" as ConsentFormType,
    description: "Authorization to receive home care services",
    version: 1,
    isActive: true,
    isRequired: true,
    requiresWitness: false,
    requiresDate: true,
    expiresAfterDays: null,
    content: `
<h2>CONSENT FOR HOME CARE SERVICES</h2>

<p>I, the undersigned, hereby consent to receive home care services from [COMPANY_NAME].</p>

<h3>Services Authorized</h3>
<p>I understand that the services provided may include, but are not limited to:</p>
<ul>
  <li>Personal care assistance (bathing, dressing, grooming, toileting)</li>
  <li>Mobility assistance and transfers</li>
  <li>Medication reminders</li>
  <li>Meal preparation and feeding assistance</li>
  <li>Light housekeeping</li>
  <li>Companionship and supervision</li>
</ul>

<h3>Rights and Responsibilities</h3>
<p>I understand that I have the right to:</p>
<ul>
  <li>Be treated with dignity and respect</li>
  <li>Participate in the development of my care plan</li>
  <li>Refuse any service at any time</li>
  <li>Voice concerns or complaints without fear of retaliation</li>
  <li>Access my records upon request</li>
</ul>

<h3>Acknowledgment</h3>
<p>I have read and understand this consent form. I have had the opportunity to ask questions, and all my questions have been answered to my satisfaction.</p>

<p>By signing below, I consent to receive home care services as described above.</p>
    `.trim(),
  },
  {
    name: "HIPAA Authorization",
    formType: "HIPAA_AUTHORIZATION" as ConsentFormType,
    description: "Authorization for use and disclosure of protected health information",
    version: 1,
    isActive: true,
    isRequired: true,
    requiresWitness: false,
    requiresDate: true,
    expiresAfterDays: null,
    content: `
<h2>HIPAA AUTHORIZATION FOR DISCLOSURE OF HEALTH INFORMATION</h2>

<p>I hereby authorize [COMPANY_NAME] to use and/or disclose my protected health information (PHI) as described below.</p>

<h3>Information to be Disclosed</h3>
<p>The following health information may be used or disclosed:</p>
<ul>
  <li>Medical history and diagnoses</li>
  <li>Treatment records and care plans</li>
  <li>Medication lists</li>
  <li>Assessment results</li>
  <li>Progress notes and visit documentation</li>
</ul>

<h3>Purpose of Disclosure</h3>
<p>This information may be used or disclosed for the following purposes:</p>
<ul>
  <li>Coordination of care with other healthcare providers</li>
  <li>Insurance billing and claims processing</li>
  <li>Quality improvement activities</li>
  <li>Legal and regulatory compliance</li>
</ul>

<h3>Persons Authorized to Receive Information</h3>
<ul>
  <li>Maryland Medicaid and its authorized agents</li>
  <li>Physicians and healthcare providers involved in my care</li>
  <li>Emergency contacts designated by me</li>
</ul>

<h3>Expiration</h3>
<p>This authorization will remain in effect until I revoke it in writing, or until my services with [COMPANY_NAME] are terminated.</p>

<h3>My Rights</h3>
<p>I understand that:</p>
<ul>
  <li>I may revoke this authorization at any time in writing</li>
  <li>Treatment cannot be conditioned on signing this authorization</li>
  <li>Information disclosed may no longer be protected by federal privacy rules</li>
  <li>I am entitled to a copy of this signed authorization</li>
</ul>
    `.trim(),
  },
  {
    name: "Medicaid Assignment of Benefits",
    formType: "MEDICAID_ASSIGNMENT" as ConsentFormType,
    description: "Authorization to bill Medicaid and receive payment on behalf of the client",
    version: 1,
    isActive: true,
    isRequired: true,
    requiresWitness: false,
    requiresDate: true,
    expiresAfterDays: null,
    content: `
<h2>ASSIGNMENT OF MEDICAID BENEFITS</h2>

<p>I, the undersigned, hereby assign my Medicaid benefits to [COMPANY_NAME] for home care services rendered.</p>

<h3>Assignment</h3>
<p>I hereby authorize and assign payment of Medicaid benefits directly to [COMPANY_NAME] for services provided to me. I understand that I am financially responsible for any services not covered by Medicaid.</p>

<h3>Authorization to Release Information</h3>
<p>I authorize [COMPANY_NAME] to release any information required to process claims with Maryland Medicaid, including but not limited to:</p>
<ul>
  <li>My Medicaid identification number</li>
  <li>Dates and types of services provided</li>
  <li>Diagnosis codes and medical information necessary for billing</li>
  <li>Authorization numbers and care plan information</li>
</ul>

<h3>Certification</h3>
<p>I certify that the information provided regarding my Medicaid coverage is accurate to the best of my knowledge. I understand that any false statements may result in denial of benefits and potential legal action.</p>

<h3>Acknowledgment</h3>
<p>I have read and understand this Assignment of Benefits form. I understand that this assignment does not release me from financial responsibility for non-covered services.</p>
    `.trim(),
  },
  {
    name: "Client Rights and Responsibilities",
    formType: "CLIENT_RIGHTS" as ConsentFormType,
    description: "Acknowledgment of client rights in accordance with Maryland regulations",
    version: 1,
    isActive: true,
    isRequired: true,
    requiresWitness: false,
    requiresDate: true,
    expiresAfterDays: null,
    content: `
<h2>CLIENT RIGHTS AND RESPONSIBILITIES</h2>

<h3>Your Rights</h3>
<p>As a client of [COMPANY_NAME], you have the right to:</p>
<ol>
  <li><strong>Respect and Dignity:</strong> Be treated with courtesy, respect, and dignity at all times.</li>
  <li><strong>Privacy:</strong> Have your personal and medical information kept confidential.</li>
  <li><strong>Information:</strong> Receive complete information about your care, services, and costs.</li>
  <li><strong>Participation:</strong> Participate in the development and revision of your care plan.</li>
  <li><strong>Choice:</strong> Choose your caregivers when feasible and request a change if unsatisfied.</li>
  <li><strong>Refusal:</strong> Refuse any service or treatment without retaliation.</li>
  <li><strong>Safety:</strong> Receive care in a safe environment free from abuse, neglect, and exploitation.</li>
  <li><strong>Grievance:</strong> Voice complaints and grievances without fear of reprisal.</li>
  <li><strong>Records Access:</strong> Review and obtain copies of your records upon request.</li>
  <li><strong>Non-Discrimination:</strong> Receive services without discrimination based on race, color, religion, national origin, sex, age, or disability.</li>
</ol>

<h3>Your Responsibilities</h3>
<p>As a client, you agree to:</p>
<ol>
  <li>Provide accurate and complete information about your health condition.</li>
  <li>Follow the agreed-upon care plan.</li>
  <li>Treat caregivers with respect and courtesy.</li>
  <li>Notify the agency of any changes in your condition or care needs.</li>
  <li>Maintain a safe environment for caregivers.</li>
  <li>Notify the agency if you will not be available for scheduled visits.</li>
</ol>

<h3>Acknowledgment</h3>
<p>I have received, read, and understand my rights and responsibilities as a client of [COMPANY_NAME].</p>
    `.trim(),
  },
  {
    name: "Notice of Privacy Practices",
    formType: "PRIVACY_PRACTICES" as ConsentFormType,
    description: "Acknowledgment of receipt of privacy practices notice",
    version: 1,
    isActive: true,
    isRequired: true,
    requiresWitness: false,
    requiresDate: true,
    expiresAfterDays: null,
    content: `
<h2>NOTICE OF PRIVACY PRACTICES ACKNOWLEDGMENT</h2>

<p>I acknowledge that I have received a copy of [COMPANY_NAME]'s Notice of Privacy Practices.</p>

<h3>Summary of Privacy Practices</h3>
<p>The Notice of Privacy Practices describes:</p>
<ul>
  <li>How your medical information may be used and disclosed</li>
  <li>Your rights regarding your health information</li>
  <li>Our duties to protect your health information</li>
  <li>How to file a complaint if you believe your privacy rights have been violated</li>
</ul>

<h3>Uses and Disclosures</h3>
<p>Your health information may be used for:</p>
<ul>
  <li>Treatment and coordination of care</li>
  <li>Payment and billing activities</li>
  <li>Healthcare operations and quality improvement</li>
  <li>As required by law</li>
</ul>

<h3>Your Rights</h3>
<p>You have the right to:</p>
<ul>
  <li>Request restrictions on certain uses of your information</li>
  <li>Request confidential communications</li>
  <li>Inspect and copy your health records</li>
  <li>Request amendments to your records</li>
  <li>Receive an accounting of disclosures</li>
  <li>Obtain a paper copy of this notice</li>
</ul>

<h3>Acknowledgment</h3>
<p>By signing below, I acknowledge that I have received a copy of the Notice of Privacy Practices.</p>
    `.trim(),
  },
  {
    name: "Abuse, Neglect, and Exploitation Reporting",
    formType: "ABUSE_NEGLECT_REPORTING" as ConsentFormType,
    description: "Information about mandatory reporting requirements",
    version: 1,
    isActive: true,
    isRequired: true,
    requiresWitness: false,
    requiresDate: true,
    expiresAfterDays: null,
    content: `
<h2>ABUSE, NEGLECT, AND EXPLOITATION REPORTING</h2>

<h3>Mandatory Reporting</h3>
<p>[COMPANY_NAME] and its staff are mandated reporters under Maryland law. We are required to report suspected abuse, neglect, or exploitation to the appropriate authorities.</p>

<h3>Definitions</h3>
<p><strong>Abuse:</strong> The physical or mental injury of a vulnerable adult caused by another person, including sexual abuse.</p>
<p><strong>Neglect:</strong> The failure to provide necessary care, including food, shelter, clothing, medical care, and supervision.</p>
<p><strong>Exploitation:</strong> The illegal or improper use of a vulnerable adult's resources for another's profit or advantage.</p>
<p><strong>Self-Neglect:</strong> The inability or failure to provide oneself with necessary care.</p>

<h3>Reporting</h3>
<p>If you suspect or witness abuse, neglect, or exploitation, you may report it to:</p>
<ul>
  <li><strong>Maryland Adult Protective Services:</strong> 1-800-91-PREVENT (1-800-917-7383)</li>
  <li><strong>Maryland Health Care Commission:</strong> 410-764-3460</li>
  <li><strong>Local Law Enforcement:</strong> 911 for emergencies</li>
</ul>

<h3>Your Protection</h3>
<p>You have the right to be free from abuse, neglect, and exploitation. Our staff is trained to recognize signs of abuse and to report any concerns immediately.</p>

<h3>Acknowledgment</h3>
<p>I have been informed of the mandatory reporting requirements and know how to report suspected abuse, neglect, or exploitation.</p>
    `.trim(),
  },
  {
    name: "Grievance Procedure",
    formType: "GRIEVANCE_PROCEDURE" as ConsentFormType,
    description: "Information about how to file complaints and grievances",
    version: 1,
    isActive: true,
    isRequired: true,
    requiresWitness: false,
    requiresDate: true,
    expiresAfterDays: null,
    content: `
<h2>GRIEVANCE PROCEDURE</h2>

<h3>Your Right to File a Grievance</h3>
<p>You have the right to voice complaints or concerns about your care without fear of retaliation. We encourage you to communicate any concerns so we can address them promptly.</p>

<h3>How to File a Grievance</h3>
<p><strong>Step 1:</strong> Contact your assigned care coordinator or supervisor to discuss your concern. Many issues can be resolved at this level.</p>
<p><strong>Step 2:</strong> If not resolved, submit a written grievance to our Grievance Officer at [COMPANY_ADDRESS].</p>
<p><strong>Step 3:</strong> Our Grievance Officer will investigate and respond within 10 business days.</p>
<p><strong>Step 4:</strong> If still not satisfied, you may appeal to the Administrator.</p>

<h3>External Complaints</h3>
<p>You may also file complaints with:</p>
<ul>
  <li><strong>Maryland Department of Health:</strong> 410-767-6500</li>
  <li><strong>Maryland Office of Health Care Quality:</strong> 410-402-8015</li>
  <li><strong>Maryland Medicaid Ombudsman:</strong> 1-800-638-3247</li>
</ul>

<h3>Non-Retaliation Policy</h3>
<p>We have a strict non-retaliation policy. Filing a grievance will not affect the quality of care you receive or result in any negative consequences.</p>

<h3>Acknowledgment</h3>
<p>I have received and understand the grievance procedure. I know how to file a complaint if I have concerns about my care.</p>
    `.trim(),
  },
  {
    name: "Fall Risk Acknowledgment",
    formType: "FALL_RISK_ACKNOWLEDGEMENT" as ConsentFormType,
    description: "Acknowledgment of fall prevention education and precautions",
    version: 1,
    isActive: true,
    isRequired: true,
    requiresWitness: false,
    requiresDate: true,
    expiresAfterDays: null,
    content: `
<h2>FALL RISK ACKNOWLEDGMENT AND PREVENTION</h2>

<h3>Fall Risk Information</h3>
<p>Falls are a leading cause of injury among older adults and individuals receiving home care services. [COMPANY_NAME] is committed to reducing your risk of falls through education and prevention strategies.</p>

<h3>Risk Factors</h3>
<p>Common fall risk factors include:</p>
<ul>
  <li>Mobility impairments or balance problems</li>
  <li>Medication side effects</li>
  <li>Vision or hearing problems</li>
  <li>Home hazards (loose rugs, poor lighting, clutter)</li>
  <li>Footwear issues</li>
  <li>Cognitive impairment</li>
</ul>

<h3>Prevention Strategies</h3>
<p>To reduce your fall risk:</p>
<ul>
  <li>Remove or secure loose rugs and electrical cords</li>
  <li>Ensure adequate lighting throughout your home</li>
  <li>Install grab bars in bathrooms</li>
  <li>Use non-slip mats in bathtub/shower</li>
  <li>Wear supportive, non-slip footwear</li>
  <li>Use assistive devices as recommended</li>
  <li>Keep frequently used items within easy reach</li>
</ul>

<h3>Caregiver Assistance</h3>
<p>Your caregiver will assist you with transfers and mobility as indicated in your care plan. Please always ask for help when needed.</p>

<h3>Acknowledgment</h3>
<p>I have received fall prevention education and understand the importance of following safety precautions. I agree to ask for assistance when needed and to notify my care team of any falls or near-falls.</p>
    `.trim(),
  },
  {
    name: "Emergency Treatment Authorization",
    formType: "EMERGENCY_TREATMENT" as ConsentFormType,
    description: "Authorization for emergency medical treatment",
    version: 1,
    isActive: true,
    isRequired: true,
    requiresWitness: false,
    requiresDate: true,
    expiresAfterDays: null,
    content: `
<h2>EMERGENCY TREATMENT AUTHORIZATION</h2>

<h3>Emergency Procedures</h3>
<p>In the event of a medical emergency, [COMPANY_NAME] caregivers are trained to:</p>
<ol>
  <li>Call 911 immediately</li>
  <li>Administer basic first aid as trained</li>
  <li>Contact your emergency contact(s)</li>
  <li>Notify our office</li>
</ol>

<h3>Emergency Contact Information</h3>
<p>Please ensure your emergency contact information is current and accurate in our records.</p>

<h3>Medical Information</h3>
<p>Our caregivers will provide emergency responders with:</p>
<ul>
  <li>Your current medication list</li>
  <li>Known allergies</li>
  <li>Primary physician information</li>
  <li>Advance directive information (if applicable)</li>
</ul>

<h3>Authorization</h3>
<p>I authorize [COMPANY_NAME] staff to:</p>
<ul>
  <li>Call emergency services (911) on my behalf</li>
  <li>Provide emergency responders with my medical information</li>
  <li>Accompany me to the hospital if necessary and safe to do so</li>
  <li>Contact my designated emergency contacts</li>
</ul>

<h3>Advance Directives</h3>
<p>If you have an advance directive (living will, DNR, POLST), please provide a copy to be kept in your file. Our staff will follow your documented wishes.</p>

<h3>Acknowledgment</h3>
<p>I understand the emergency procedures and authorize the actions described above. I have provided current emergency contact information and copies of any advance directives.</p>
    `.trim(),
  },
];

// Main seeding function
async function seedMarylandConfiguration() {
  console.log("Starting Maryland state configuration seed...");

  // Create or update state configuration
  const stateConfig = await prisma.stateConfiguration.upsert({
    where: { stateCode: MARYLAND_STATE_CONFIG.stateCode },
    update: {
      ...MARYLAND_STATE_CONFIG,
      updatedAt: new Date(),
    },
    create: MARYLAND_STATE_CONFIG,
  });

  console.log(`Created/updated state configuration: ${stateConfig.stateName}`);

  // Create assessment templates
  const assessmentTemplates = [
    KATZ_ADL_TEMPLATE,
    LAWTON_IADL_TEMPLATE,
    PHQ9_TEMPLATE,
    MINI_COG_TEMPLATE,
  ];

  for (const template of assessmentTemplates) {
    const { sections, ...templateData } = template;

    // Check if template exists
    const existingTemplate = await prisma.assessmentTemplate.findFirst({
      where: {
        name: templateData.name,
        stateConfigId: stateConfig.id,
      },
    });

    if (existingTemplate) {
      console.log(`Assessment template already exists: ${templateData.name}`);
      continue;
    }

    // Create template
    const createdTemplate = await prisma.assessmentTemplate.create({
      data: {
        ...templateData,
        stateConfigId: stateConfig.id,
      },
    });

    console.log(`Created assessment template: ${createdTemplate.name}`);

    // Create sections and items
    for (const section of sections) {
      const { items, ...sectionData } = section;

      const createdSection = await prisma.assessmentTemplateSection.create({
        data: {
          ...sectionData,
          templateId: createdTemplate.id,
        },
      });

      console.log(`  Created section: ${createdSection.title}`);

      // Create items
      for (const item of items) {
        const itemData = item as Record<string, unknown>;
        await prisma.assessmentTemplateItem.create({
          data: {
            code: itemData.code as string,
            question: itemData.question as string,
            description: (itemData.description as string) || undefined,
            responseType: itemData.responseType as AssessmentResponseType,
            displayOrder: itemData.displayOrder as number,
            isRequired: (itemData.isRequired as boolean) ?? true,
            responseOptions: itemData.responseOptions as object,
            minValue: (itemData.minValue as number) || undefined,
            maxValue: (itemData.maxValue as number) || undefined,
            scoreMapping: (itemData.scoreMapping as object) || undefined,
            sectionId: createdSection.id,
          },
        });
      }

      console.log(`    Created ${items.length} items`);
    }
  }

  // Create consent form templates
  for (const consent of CONSENT_FORM_TEMPLATES) {
    const existingConsent = await prisma.consentFormTemplate.findFirst({
      where: {
        formType: consent.formType,
        stateConfigId: stateConfig.id,
      },
    });

    if (existingConsent) {
      console.log(`Consent form already exists: ${consent.name}`);
      continue;
    }

    const createdConsent = await prisma.consentFormTemplate.create({
      data: {
        ...consent,
        stateConfigId: stateConfig.id,
      },
    });

    console.log(`Created consent form template: ${createdConsent.name}`);
  }

  console.log("\nMaryland state configuration seed completed successfully!");
}

// Export for use in main seed file
export { seedMarylandConfiguration };

// Run if called directly
if (require.main === module) {
  seedMarylandConfiguration()
    .catch((e) => {
      console.error("Error seeding Maryland configuration:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
