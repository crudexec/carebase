import { PrismaClient, FormFieldType, FormTemplateStatus, FormTemplateType } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to create the base IISS template structure
function getIISSTemplate() {
  return {
    name: "IISS Visit Note",
    description:
      "Intensive Individual Support Services visit documentation. Tracks session highlights, skills development across 9 training areas, and behavioral management.",
    sections: [
      // Step 1: Session Information & Communication
      {
        title: "Step 1: Session Information",
        description: "Basic session details, compliance, and communication methods",
        order: 0,
        fields: [
          {
            label: "Visit Date",
            type: FormFieldType.DATE,
            required: true,
            order: 0,
            config: {},
          },
          {
            label: "Session Start Time",
            type: FormFieldType.TIME,
            required: true,
            order: 1,
            config: {},
          },
          {
            label: "Session End Time",
            type: FormFieldType.TIME,
            required: true,
            order: 2,
            config: {},
          },
          {
            label: "Service Location",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 3,
            config: {
              options: ["Client's Home", "Community", "School", "Day Program", "Provider Office", "Other"],
            },
          },
          {
            label: "Location Details (if Other)",
            type: FormFieldType.TEXT_SHORT,
            required: false,
            order: 4,
            config: { placeholder: "Specify location if Other selected" },
          },
          {
            label: "Compliance Level",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 5,
            config: {
              options: ["Fully Compliant", "Mostly Compliant", "Partially Compliant", "Non-Compliant"],
            },
          },
          {
            label: "Injury to Self",
            type: FormFieldType.YES_NO,
            required: true,
            order: 6,
            config: {},
          },
          {
            label: "Aggression Toward Others",
            type: FormFieldType.YES_NO,
            required: true,
            order: 7,
            config: {},
          },
          {
            label: "Client Hospitalized",
            type: FormFieldType.YES_NO,
            required: false,
            order: 8,
            config: {},
          },
          {
            label: "Communication Methods Used",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 9,
            config: {
              options: [
                "Verbal/Spoken Language",
                "Limited Verbal",
                "Gestures/Pointing",
                "Sign Language",
                "AAC Device/Tablet",
                "PECS (Picture Exchange)",
                "Communication Board",
                "Photographs/Icons",
                "Written Words",
              ],
            },
          },
          {
            label: "Communication Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 10,
            config: { placeholder: "Describe communication interactions during session..." },
          },
        ],
      },

      // Step 2: Skills Development (9 Training Areas)
      {
        title: "Step 2: Domestic Skills Training",
        description: "Household and domestic skill development activities",
        order: 1,
        fields: [
          {
            label: "Domestic Skills Worked On",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 0,
            config: {
              options: [
                "Bed Making",
                "Room Cleaning",
                "Dusting",
                "Vacuuming",
                "Laundry - Sorting",
                "Laundry - Washing",
                "Laundry - Folding",
                "Dishes - Washing",
                "Dishes - Drying/Putting Away",
                "Taking Out Trash",
                "General Tidying",
                "Other Domestic Task",
              ],
            },
          },
          {
            label: "Domestic Skills Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe progress and assistance level..." },
          },
        ],
      },
      {
        title: "Step 2: Play & Leisure",
        description: "Recreational and leisure activity engagement",
        order: 2,
        fields: [
          {
            label: "Play/Leisure Activities",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 0,
            config: {
              options: [
                "Board Games",
                "Card Games",
                "Puzzles",
                "Arts & Crafts",
                "Music/Dancing",
                "Reading/Books",
                "Video Games",
                "Outdoor Play",
                "Sports/Exercise",
                "Sensory Play",
                "Imaginative Play",
                "Other Activity",
              ],
            },
          },
          {
            label: "Play/Leisure Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe engagement, turn-taking, and enjoyment..." },
          },
        ],
      },
      {
        title: "Step 2: Snack & Meal Time",
        description: "Eating skills and mealtime behaviors",
        order: 3,
        fields: [
          {
            label: "Meal/Snack Skills",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 0,
            config: {
              options: [
                "Using Utensils Appropriately",
                "Drinking from Cup/Glass",
                "Chewing/Swallowing Safely",
                "Staying Seated During Meals",
                "Requesting Food/Drink",
                "Food Preparation",
                "Following Mealtime Routines",
                "Trying New Foods",
                "Appropriate Portion Control",
                "Table Manners",
              ],
            },
          },
          {
            label: "Meal Time Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe mealtime behaviors and progress..." },
          },
        ],
      },
      {
        title: "Step 2: Personal Care",
        description: "Personal hygiene and self-care skills",
        order: 4,
        fields: [
          {
            label: "Personal Care Skills",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 0,
            config: {
              options: [
                "Toileting - Independent",
                "Toileting - With Prompting",
                "Hand Washing",
                "Face Washing",
                "Teeth Brushing",
                "Hair Brushing/Grooming",
                "Bathing/Showering",
                "Dressing - Putting On",
                "Dressing - Taking Off",
                "Tying Shoes",
                "Using Deodorant",
                "Menstrual Care (if applicable)",
              ],
            },
          },
          {
            label: "Bowel/Bladder Control Status",
            type: FormFieldType.SINGLE_CHOICE,
            required: false,
            order: 1,
            config: {
              options: [
                "Fully Continent",
                "Occasional Accidents",
                "Frequent Accidents",
                "Uses Protective Undergarments",
                "Not Applicable",
              ],
            },
          },
          {
            label: "Personal Care Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 2,
            config: { placeholder: "Describe assistance provided and progress..." },
          },
        ],
      },
      {
        title: "Step 2: Socialization",
        description: "Social interaction and relationship skills",
        order: 5,
        fields: [
          {
            label: "Socialization Skills",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 0,
            config: {
              options: [
                "Greeting Others",
                "Making Eye Contact",
                "Turn Taking in Conversation",
                "Sharing Items/Space",
                "Waiting Patiently",
                "Following Social Rules",
                "Respecting Personal Space",
                "Reading Social Cues",
                "Expressing Emotions Appropriately",
                "Conflict Resolution",
                "Making Friends",
                "Group Participation",
              ],
            },
          },
          {
            label: "Socialization Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe social interactions observed..." },
          },
        ],
      },
      {
        title: "Step 2: Safety & Survival Skills",
        description: "Safety awareness and emergency response skills",
        order: 6,
        fields: [
          {
            label: "Safety Skills",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 0,
            config: {
              options: [
                "Stranger Awareness",
                "Street/Traffic Safety",
                "Fire Safety/Evacuation",
                "Calling 911",
                "Knowing Personal Information",
                "Kitchen Safety",
                "Water Safety",
                "Medication Safety",
                "Internet Safety",
                "Staying in Designated Area",
                "Following Safety Rules",
              ],
            },
          },
          {
            label: "Safety Skills Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe safety skills practiced and understanding demonstrated..." },
          },
        ],
      },
      {
        title: "Step 2: Money Utilization",
        description: "Money recognition and financial skills",
        order: 7,
        fields: [
          {
            label: "Money Skills Practiced",
            type: FormFieldType.YES_NO,
            required: false,
            order: 0,
            config: {},
          },
          {
            label: "Money Skills",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 1,
            config: {
              options: [
                "Coin Recognition",
                "Bill Recognition",
                "Counting Money",
                "Making Change",
                "Using Money in Community",
                "Understanding Prices",
                "Budgeting Concepts",
                "Using Debit/Credit Card",
              ],
            },
          },
          {
            label: "Money Skills Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 2,
            config: { placeholder: "Describe money skills activities and progress..." },
          },
        ],
      },
      {
        title: "Step 2: Sensory & Motor Development",
        description: "Sensory processing and motor skill activities",
        order: 8,
        fields: [
          {
            label: "Sensory/Motor Activities",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 0,
            config: {
              options: [
                "Gross Motor Activities",
                "Fine Motor Activities",
                "Sensory Integration Activities",
                "Proprioceptive Input",
                "Vestibular Activities",
                "Tactile Exploration",
                "Visual Motor Tasks",
                "Balance Activities",
                "Coordination Exercises",
                "Calming Sensory Strategies",
              ],
            },
          },
          {
            label: "Sensory/Motor Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe sensory needs addressed and motor activities..." },
          },
        ],
      },
      {
        title: "Step 2: Personal Work & Reading",
        description: "Academic and vocational skill development",
        order: 9,
        fields: [
          {
            label: "Academic/Work Skills",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 0,
            config: {
              options: [
                "Reading Practice",
                "Writing Practice",
                "Math Skills",
                "Following Instructions",
                "Task Completion",
                "Time Management",
                "Organization Skills",
                "Job-Related Tasks",
                "Computer/Technology Skills",
              ],
            },
          },
          {
            label: "Academic/Work Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe academic or work-related activities..." },
          },
        ],
      },

      // Step 3: Behavioral & Goal Tracking
      {
        title: "Step 3: Self Management",
        description: "Self-regulation and executive function skills",
        order: 10,
        fields: [
          {
            label: "Self Management Skills Observed",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 0,
            config: {
              options: [
                "Responding to Name/Instructions",
                "Sharing with Others",
                "Turn Taking",
                "Following Rules",
                "Accepting 'No'",
                "Transitioning Between Activities",
                "Self-Calming When Upset",
                "Asking for Help",
                "Making Choices",
                "Problem Solving",
              ],
            },
          },
          {
            label: "Self Management Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe self-management skills and progress..." },
          },
        ],
      },
      {
        title: "Step 3: Behavior Incidents",
        description: "Document any behavioral incidents during the session",
        order: 11,
        fields: [
          {
            label: "Were there any behavior incidents?",
            type: FormFieldType.YES_NO,
            required: true,
            order: 0,
            config: {},
          },
          {
            label: "Incident Type(s)",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 1,
            config: {
              options: [
                "Aggression - Physical",
                "Aggression - Verbal",
                "Self-Injury",
                "Property Destruction",
                "Elopement/Running",
                "Non-Compliance",
                "Tantrum/Meltdown",
                "Pica",
                "Stereotypy (Disruptive)",
                "Other",
              ],
            },
          },
          {
            label: "Incident Description",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 2,
            config: { placeholder: "Describe what happened, triggers, and duration..." },
          },
          {
            label: "Interventions Used",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 3,
            config: { placeholder: "Describe how staff responded and intervention strategies used..." },
          },
          {
            label: "Incident Resolved",
            type: FormFieldType.YES_NO,
            required: false,
            order: 4,
            config: {},
          },
          {
            label: "Incident Severity",
            type: FormFieldType.SINGLE_CHOICE,
            required: false,
            order: 5,
            config: {
              options: ["Mild", "Moderate", "Severe", "Required Medical Attention"],
            },
          },
        ],
      },
      {
        title: "Step 3: Concerns & Challenges",
        description: "Any concerns or challenges during the session",
        order: 12,
        fields: [
          {
            label: "Were there concerns or challenges?",
            type: FormFieldType.YES_NO,
            required: true,
            order: 0,
            config: {},
          },
          {
            label: "Concern Description",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe any concerns or challenges observed..." },
          },
          {
            label: "Supervisor Contacted",
            type: FormFieldType.YES_NO,
            required: false,
            order: 2,
            config: {},
          },
          {
            label: "Supervisor Contact Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 3,
            config: { placeholder: "If supervisor was contacted, describe the conversation..." },
          },
        ],
      },
      {
        title: "Step 3: Session Summary & Goals",
        description: "Overall session highlights and goal progress",
        order: 13,
        fields: [
          {
            label: "Session Highlights",
            type: FormFieldType.TEXT_LONG,
            required: true,
            order: 0,
            config: { placeholder: "Summarize key achievements and activities during this session..." },
          },
          {
            label: "Goals Worked On",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "List the treatment plan goals addressed during this session..." },
          },
          {
            label: "Goal Progress Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 2,
            config: { placeholder: "Describe progress made toward goals..." },
          },
          {
            label: "Plan for Next Session",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 3,
            config: { placeholder: "What will be the focus of the next session?" },
          },
          {
            label: "Staff Signature",
            type: FormFieldType.SIGNATURE,
            required: true,
            order: 4,
            config: {},
          },
        ],
      },
    ],
  };
}

// FC (Family Consultation) Template - Simplified version with family focus
function getFCTemplate() {
  return {
    name: "FC Visit Note",
    description:
      "Family Consultation visit documentation. Focuses on family training, parent coaching, and home strategy implementation.",
    sections: [
      {
        title: "Session Information",
        description: "Basic session details",
        order: 0,
        fields: [
          {
            label: "Visit Date",
            type: FormFieldType.DATE,
            required: true,
            order: 0,
            config: {},
          },
          {
            label: "Session Start Time",
            type: FormFieldType.TIME,
            required: true,
            order: 1,
            config: {},
          },
          {
            label: "Session End Time",
            type: FormFieldType.TIME,
            required: true,
            order: 2,
            config: {},
          },
          {
            label: "Service Location",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 3,
            config: {
              options: ["Client's Home", "Provider Office", "Virtual/Telehealth", "Community", "Other"],
            },
          },
          {
            label: "Family Members Present",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: true,
            order: 4,
            config: {
              options: ["Mother", "Father", "Both Parents", "Grandparent", "Sibling", "Other Caregiver", "Client"],
            },
          },
        ],
      },
      {
        title: "Client Status",
        description: "Client's status and behavior during session",
        order: 1,
        fields: [
          {
            label: "Client Present During Session",
            type: FormFieldType.YES_NO,
            required: true,
            order: 0,
            config: {},
          },
          {
            label: "Compliance Level (if client present)",
            type: FormFieldType.SINGLE_CHOICE,
            required: false,
            order: 1,
            config: {
              options: ["Fully Compliant", "Mostly Compliant", "Partially Compliant", "Non-Compliant", "N/A"],
            },
          },
          {
            label: "Any Incidents Since Last Visit",
            type: FormFieldType.YES_NO,
            required: true,
            order: 2,
            config: {},
          },
          {
            label: "Incident Details",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 3,
            config: { placeholder: "Describe any incidents reported by family..." },
          },
        ],
      },
      {
        title: "Family Training Topics",
        description: "Topics covered during the family consultation",
        order: 2,
        fields: [
          {
            label: "Training Topics Covered",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: true,
            order: 0,
            config: {
              options: [
                "Behavior Management Strategies",
                "Communication Techniques",
                "Daily Living Skills Support",
                "Sensory Strategies",
                "Safety Planning",
                "Community Integration",
                "Educational Support",
                "Medication Management",
                "Crisis Prevention",
                "Self-Care for Caregivers",
                "Resource Navigation",
                "Transition Planning",
                "Other",
              ],
            },
          },
          {
            label: "Training Content/Discussion",
            type: FormFieldType.TEXT_LONG,
            required: true,
            order: 1,
            config: { placeholder: "Describe what was taught or discussed with the family..." },
          },
          {
            label: "Family Questions/Concerns",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 2,
            config: { placeholder: "Document any questions or concerns raised by family..." },
          },
        ],
      },
      {
        title: "Strategies & Recommendations",
        description: "Strategies implemented and recommendations",
        order: 3,
        fields: [
          {
            label: "Strategies Demonstrated",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 0,
            config: { placeholder: "Describe strategies demonstrated to family members..." },
          },
          {
            label: "Home Practice Assignments",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "What should the family practice before next session?" },
          },
          {
            label: "Resources Provided",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 2,
            config: { placeholder: "List any handouts, links, or resources provided..." },
          },
        ],
      },
      {
        title: "Session Summary",
        description: "Overall session summary and next steps",
        order: 4,
        fields: [
          {
            label: "Session Summary",
            type: FormFieldType.TEXT_LONG,
            required: true,
            order: 0,
            config: { placeholder: "Summarize the key points of this family consultation..." },
          },
          {
            label: "Family Engagement Level",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 1,
            config: {
              options: ["Highly Engaged", "Moderately Engaged", "Minimally Engaged", "Not Engaged"],
            },
          },
          {
            label: "Plan for Next Session",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 2,
            config: { placeholder: "What will be covered in the next family consultation?" },
          },
          {
            label: "Staff Signature",
            type: FormFieldType.SIGNATURE,
            required: true,
            order: 3,
            config: {},
          },
        ],
      },
    ],
  };
}

// ITI (Individual Therapeutic Integration) Template
function getITITemplate() {
  return {
    name: "ITI Visit Note",
    description:
      "Individual Therapeutic Integration visit documentation. Focuses on therapeutic interventions and community integration skills.",
    sections: [
      {
        title: "Session Information",
        description: "Basic session details",
        order: 0,
        fields: [
          {
            label: "Visit Date",
            type: FormFieldType.DATE,
            required: true,
            order: 0,
            config: {},
          },
          {
            label: "Session Start Time",
            type: FormFieldType.TIME,
            required: true,
            order: 1,
            config: {},
          },
          {
            label: "Session End Time",
            type: FormFieldType.TIME,
            required: true,
            order: 2,
            config: {},
          },
          {
            label: "Service Location",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 3,
            config: {
              options: ["Community Setting", "Client's Home", "Day Program", "School", "Provider Office", "Other"],
            },
          },
          {
            label: "Location Specifics",
            type: FormFieldType.TEXT_SHORT,
            required: false,
            order: 4,
            config: { placeholder: "Specific location details (e.g., grocery store, park name)..." },
          },
          {
            label: "Compliance Level",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 5,
            config: {
              options: ["Fully Compliant", "Mostly Compliant", "Partially Compliant", "Non-Compliant"],
            },
          },
        ],
      },
      {
        title: "Therapeutic Interventions",
        description: "Therapeutic techniques and interventions used",
        order: 1,
        fields: [
          {
            label: "Intervention Types",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: true,
            order: 0,
            config: {
              options: [
                "Applied Behavior Analysis (ABA)",
                "Social Skills Training",
                "Cognitive Behavioral Techniques",
                "Sensory Integration",
                "Visual Supports",
                "Structured Teaching",
                "Positive Reinforcement",
                "Task Analysis",
                "Modeling/Demonstration",
                "Prompting & Fading",
                "Self-Monitoring Strategies",
                "Crisis Intervention",
              ],
            },
          },
          {
            label: "Intervention Description",
            type: FormFieldType.TEXT_LONG,
            required: true,
            order: 1,
            config: { placeholder: "Describe the therapeutic interventions implemented..." },
          },
          {
            label: "Client Response to Interventions",
            type: FormFieldType.TEXT_LONG,
            required: true,
            order: 2,
            config: { placeholder: "How did the client respond to interventions?" },
          },
        ],
      },
      {
        title: "Community Integration",
        description: "Community-based skills and integration activities",
        order: 2,
        fields: [
          {
            label: "Community Skills Practiced",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: false,
            order: 0,
            config: {
              options: [
                "Using Public Transportation",
                "Shopping/Purchasing",
                "Restaurant/Food Service",
                "Library Use",
                "Recreation/Leisure Venues",
                "Medical Appointments",
                "Social Activities",
                "Employment Related",
                "Community Safety",
                "Social Interactions with Community Members",
              ],
            },
          },
          {
            label: "Community Integration Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe community activities and client's performance..." },
          },
        ],
      },
      {
        title: "Behavior & Safety",
        description: "Behavioral observations and safety concerns",
        order: 3,
        fields: [
          {
            label: "Injury to Self",
            type: FormFieldType.YES_NO,
            required: true,
            order: 0,
            config: {},
          },
          {
            label: "Aggression Toward Others",
            type: FormFieldType.YES_NO,
            required: true,
            order: 1,
            config: {},
          },
          {
            label: "Any Behavior Incidents",
            type: FormFieldType.YES_NO,
            required: true,
            order: 2,
            config: {},
          },
          {
            label: "Incident Description",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 3,
            config: { placeholder: "If yes, describe the incident and response..." },
          },
        ],
      },
      {
        title: "Session Summary & Goals",
        description: "Session summary and goal progress",
        order: 4,
        fields: [
          {
            label: "Session Summary",
            type: FormFieldType.TEXT_LONG,
            required: true,
            order: 0,
            config: { placeholder: "Summarize the key activities and outcomes of this session..." },
          },
          {
            label: "Treatment Goals Addressed",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Which treatment plan goals were addressed?" },
          },
          {
            label: "Progress Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 2,
            config: { placeholder: "Describe progress toward goals..." },
          },
          {
            label: "Plan for Next Session",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 3,
            config: { placeholder: "What will be the focus of the next session?" },
          },
          {
            label: "Staff Signature",
            type: FormFieldType.SIGNATURE,
            required: true,
            order: 4,
            config: {},
          },
        ],
      },
    ],
  };
}

// ALP (Adaptive Living Program) Template
function getALPTemplate() {
  return {
    name: "ALP Visit Note",
    description:
      "Adaptive Living Program visit documentation. Focuses on independent living skills and community participation.",
    sections: [
      {
        title: "Session Information",
        description: "Basic session details",
        order: 0,
        fields: [
          {
            label: "Visit Date",
            type: FormFieldType.DATE,
            required: true,
            order: 0,
            config: {},
          },
          {
            label: "Session Start Time",
            type: FormFieldType.TIME,
            required: true,
            order: 1,
            config: {},
          },
          {
            label: "Session End Time",
            type: FormFieldType.TIME,
            required: true,
            order: 2,
            config: {},
          },
          {
            label: "Service Location",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 3,
            config: {
              options: ["Day Program Site", "Community", "Client's Home", "Employment Site", "Other"],
            },
          },
          {
            label: "Compliance Level",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 4,
            config: {
              options: ["Fully Compliant", "Mostly Compliant", "Partially Compliant", "Non-Compliant"],
            },
          },
        ],
      },
      {
        title: "Adaptive Living Skills",
        description: "Independent living and adaptive skills training",
        order: 1,
        fields: [
          {
            label: "Skills Areas Addressed",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: true,
            order: 0,
            config: {
              options: [
                "Personal Hygiene",
                "Meal Preparation",
                "Household Chores",
                "Money Management",
                "Time Management",
                "Transportation",
                "Health & Safety",
                "Social Skills",
                "Communication",
                "Leisure/Recreation",
                "Pre-Vocational Skills",
                "Self-Advocacy",
              ],
            },
          },
          {
            label: "Skills Training Description",
            type: FormFieldType.TEXT_LONG,
            required: true,
            order: 1,
            config: { placeholder: "Describe the adaptive living skills worked on during this session..." },
          },
          {
            label: "Assistance Level Required",
            type: FormFieldType.SINGLE_CHOICE,
            required: false,
            order: 2,
            config: {
              options: [
                "Independent",
                "Minimal Assistance",
                "Moderate Assistance",
                "Maximum Assistance",
                "Full Physical Assistance",
              ],
            },
          },
        ],
      },
      {
        title: "Behavioral Status",
        description: "Behavioral observations",
        order: 2,
        fields: [
          {
            label: "Overall Behavior",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 0,
            config: {
              options: ["Excellent", "Good", "Fair", "Challenging"],
            },
          },
          {
            label: "Injury to Self",
            type: FormFieldType.YES_NO,
            required: true,
            order: 1,
            config: {},
          },
          {
            label: "Aggression Toward Others",
            type: FormFieldType.YES_NO,
            required: true,
            order: 2,
            config: {},
          },
          {
            label: "Behavioral Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 3,
            config: { placeholder: "Any behavioral observations or concerns..." },
          },
        ],
      },
      {
        title: "Session Summary",
        description: "Summary and goal progress",
        order: 3,
        fields: [
          {
            label: "Session Summary",
            type: FormFieldType.TEXT_LONG,
            required: true,
            order: 0,
            config: { placeholder: "Summarize the key activities and outcomes..." },
          },
          {
            label: "Goal Progress",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe progress toward treatment plan goals..." },
          },
          {
            label: "Plan for Next Session",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 2,
            config: { placeholder: "Focus areas for next session..." },
          },
          {
            label: "Staff Signature",
            type: FormFieldType.SIGNATURE,
            required: true,
            order: 3,
            config: {},
          },
        ],
      },
    ],
  };
}

// Respite Template - Simplified version
function getRespiteTemplate() {
  return {
    name: "Respite Visit Note",
    description:
      "Respite care visit documentation. Simplified form for respite services focusing on care provided and client wellbeing.",
    sections: [
      {
        title: "Session Information",
        description: "Basic session details",
        order: 0,
        fields: [
          {
            label: "Visit Date",
            type: FormFieldType.DATE,
            required: true,
            order: 0,
            config: {},
          },
          {
            label: "Session Start Time",
            type: FormFieldType.TIME,
            required: true,
            order: 1,
            config: {},
          },
          {
            label: "Session End Time",
            type: FormFieldType.TIME,
            required: true,
            order: 2,
            config: {},
          },
          {
            label: "Service Location",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 3,
            config: {
              options: ["Client's Home", "Respite Provider's Home", "Community", "Other"],
            },
          },
          {
            label: "Compliance Level",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 4,
            config: {
              options: ["Fully Compliant", "Mostly Compliant", "Partially Compliant", "Non-Compliant"],
            },
          },
        ],
      },
      {
        title: "Care Provided",
        description: "Services and care provided during respite",
        order: 1,
        fields: [
          {
            label: "Care Activities",
            type: FormFieldType.MULTIPLE_CHOICE,
            required: true,
            order: 0,
            config: {
              options: [
                "Personal Care Assistance",
                "Meal Preparation/Feeding",
                "Medication Reminders",
                "Companionship",
                "Play/Recreation",
                "Community Outing",
                "Supervision",
                "Behavioral Support",
                "Transportation",
                "Homework/Learning Activities",
              ],
            },
          },
          {
            label: "Care Notes",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Describe care activities in detail..." },
          },
        ],
      },
      {
        title: "Client Status",
        description: "Client's status during respite",
        order: 2,
        fields: [
          {
            label: "Overall Mood",
            type: FormFieldType.SINGLE_CHOICE,
            required: true,
            order: 0,
            config: {
              options: ["Happy/Content", "Calm", "Anxious", "Upset", "Variable"],
            },
          },
          {
            label: "Injury to Self",
            type: FormFieldType.YES_NO,
            required: true,
            order: 1,
            config: {},
          },
          {
            label: "Aggression Toward Others",
            type: FormFieldType.YES_NO,
            required: true,
            order: 2,
            config: {},
          },
          {
            label: "Any Incidents or Concerns",
            type: FormFieldType.YES_NO,
            required: true,
            order: 3,
            config: {},
          },
          {
            label: "Incident/Concern Details",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 4,
            config: { placeholder: "If yes, describe the incident or concern..." },
          },
        ],
      },
      {
        title: "Session Summary",
        description: "Summary of respite session",
        order: 3,
        fields: [
          {
            label: "Session Summary",
            type: FormFieldType.TEXT_LONG,
            required: true,
            order: 0,
            config: { placeholder: "Summarize how the respite session went..." },
          },
          {
            label: "Information for Family",
            type: FormFieldType.TEXT_LONG,
            required: false,
            order: 1,
            config: { placeholder: "Any information to share with the family..." },
          },
          {
            label: "Staff Signature",
            type: FormFieldType.SIGNATURE,
            required: true,
            order: 2,
            config: {},
          },
        ],
      },
    ],
  };
}

async function main() {
  // Get the default company
  const company = await prisma.company.findFirst({
    where: {
      id: "default-company-001",
    },
  });
  if (!company) {
    throw new Error("No company found. Please create a company first.");
  }

  // Get the admin user
  const adminUser = await prisma.user.findFirst({
    where: {
      companyId: company.id,
      role: "ADMIN",
    },
  });

  if (!adminUser) {
    throw new Error("No admin user found. Please create an admin user first.");
  }

  console.log(`Creating Autism Waiver Visit Note templates for company: ${company.name}\n`);

  const templates = [
    getIISSTemplate(),
    getFCTemplate(),
    getITITemplate(),
    getALPTemplate(),
    getRespiteTemplate(),
  ];

  for (const templateData of templates) {
    // Check if template already exists
    const existingTemplate = await prisma.formTemplate.findFirst({
      where: {
        companyId: company.id,
        name: templateData.name,
      },
    });

    if (existingTemplate) {
      console.log(`Template "${templateData.name}" already exists, deleting and recreating...`);
      await prisma.formField.deleteMany({
        where: {
          section: {
            templateId: existingTemplate.id,
          },
        },
      });
      await prisma.formSection.deleteMany({
        where: { templateId: existingTemplate.id },
      });
      await prisma.formTemplate.delete({
        where: { id: existingTemplate.id },
      });
    }

    // Create the template
    const template = await prisma.formTemplate.create({
      data: {
        companyId: company.id,
        createdById: adminUser.id,
        name: templateData.name,
        description: templateData.description,
        type: FormTemplateType.VISIT_NOTE,
        status: FormTemplateStatus.ACTIVE,
        isEnabled: true,
        version: 1,
        sections: {
          create: templateData.sections.map((section) => ({
            title: section.title,
            description: section.description,
            order: section.order,
            fields: {
              create: section.fields.map((field) => ({
                label: field.label,
                type: field.type,
                required: field.required,
                order: field.order,
                config: field.config,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            fields: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    const totalFields = template.sections.reduce((acc, s) => acc + s.fields.length, 0);
    console.log(`✅ Created: ${template.name}`);
    console.log(`   ID: ${template.id}`);
    console.log(`   Sections: ${template.sections.length}, Fields: ${totalFields}\n`);
  }

  console.log("✅ All Autism Waiver Visit Note templates seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
