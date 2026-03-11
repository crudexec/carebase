export type JobPosition =
  | "DSP (Direct Care Worker)"
  | "On-Call Professional"
  | "Family Consultant"
  | "Intensive Individual Support Services(IISS)";

export const POSITION_OVERVIEWS: Record<JobPosition, string> = {
  "DSP (Direct Care Worker)":
    "The Direct Care Worker plays a vital role in providing essential support and assistance to individuals in need of direct care services. This position requires compassionate individuals who are dedicated to improving the quality of life for vulnerable populations. As a Direct Care Worker in the state of Maryland, you will be responsible for providing care, support, and supervision to individuals in various settings, ensuring their safety, well-being, and overall comfort.",
  "On-Call Professional":
    "The On-Call Professional in the Autism Waiver program is responsible for providing emergency support and guidance to individuals with autism and their families or caregivers during non-standard hours. This role aims to ensure the safety, well-being, and appropriate care of individuals with autism, especially during challenging situations or crises.",
  "Family Consultant":
    "A Family Consultant in Maryland provides professional training, guidance and consultation support and resources to individuals and families facing various personal, emotional, and interpersonal challenges. They work collaboratively with clients to assess their needs, develop tailored intervention plans, and resources to enhance their overall quality of life.",
  "Intensive Individual Support Services(IISS)":
    "The IISS Director in Maryland is responsible for the overall leadership, administration, and coordination of intensive support services designed to improve the quality of life and independence of individuals with significant developmental, behavioral, or mental health challenges. This role involves program development, staff supervision, budget management, and compliance with Maryland state regulations.",
};

export const POSITION_RESPONSIBILITIES: Record<JobPosition, string[]> = {
  "DSP (Direct Care Worker)": [
    "Personal Care Assistance: Provide assistance with activities of daily living (ADLs), including bathing, grooming, dressing, toileting, and mobility assistance, based on the individual's needs and abilities.",
    "Medication Administration: Administer medications following established protocols, ensuring accurate dosage and proper documentation as per state regulations and agency policies.",
    "Monitoring and Documentation: Observe and document the individual's physical and emotional well-being, behavior, and any changes in condition. Maintain accurate records and reports as required.",
    "Safety and Supervision: Ensure the safety and security of individuals by maintaining a safe environment, monitoring for hazards, and promptly addressing any safety concerns.",
    "Emotional Support: Provide emotional support and companionship to individuals, promoting their social and emotional well-being through active listening, empathy, and engaging in meaningful conversations.",
    "Assistance with Meals: Prepare or assist individuals with meal planning, preparation, and feeding according to their dietary needs, preferences, and any prescribed restrictions.",
    "Transportation: Accompany and assist individuals during appointments, recreational activities, or community outings, ensuring their safe transportation and adherence to scheduled activities.",
    "Household Support: Perform light housekeeping tasks, such as cleaning, laundry, and organizing, to maintain a clean and comfortable living environment for individuals.",
    "Communication and Collaboration: Maintain effective communication with individuals, their families, and interdisciplinary team members to ensure coordinated care and address any concerns or changes in care plans.",
    "Adherence to Regulations: Follow all relevant state and federal regulations, as well as agency policies and procedures, regarding the provision of direct care services.",
  ],
  "On-Call Professional": [
    "24/7 Availability: Be available on an on-call basis, including evenings, weekends, and holidays, to respond to urgent requests for support.",
    "Crisis Intervention: Respond promptly to crisis situations, including behavioral or emotional crises exhibited by individuals with autism. Provide immediate assistance and guidance to families or caregivers to de-escalate the situation and ensure safety.",
    "Assessment and Guidance: Conduct remote or in-person assessments as necessary to understand the individual's needs and the nature of the crisis. Offer guidance on effective strategies for managing challenging behaviors and promoting positive outcomes.",
    "Collaboration and Communication: Collaborate with the individual's care team, including caregivers, therapists, and support workers, to develop and implement crisis intervention plans. Maintain open and clear communication with all involved parties.",
    "Documentation: Maintain detailed records of crisis interventions, including actions taken, outcomes, and recommendations. Ensure all documentation complies with program standards and privacy regulations.",
    "Education and Support: Provide education and training to families and caregivers on managing and preventing crises. Offer emotional support and reassurance to families during difficult times.",
    "Follow-Up: Conduct follow-up checks to assess the effectiveness of crisis interventions and make necessary adjustments to plans. Ensure continuity of care and transition to regular service providers as needed.",
  ],
  "Family Consultant": [
    "Conducting comprehensive assessments of family dynamics and identifying areas for intervention and support.",
    "Providing counseling and guidance to families facing challenges such as communication breakdowns, conflict resolution, and parenting issues.",
    "Developing personalized plans in collaboration with families to address their unique needs and goals.",
    "Connecting families with community resources and support services, including mental health professionals, educational programs, and social services agencies.",
    "Monitoring progress and evaluating the effectiveness of interventions, making adjustments to plans as needed to ensure positive outcomes.",
    "Additionally, as part of our commitment to regulatory compliance and operational integrity, we request your adherence to the following clauses:",
    "Compliance with Medicaid Regulations: You are expected to comply with all applicable Medicaid regulations and guidelines while fulfilling your duties as a Family Consultant.",
    "Documentation of Service Delivery: You must diligently complete and maintain accurate written documentation of service delivery for each client, ensuring that records are detailed, up-to-date, and in compliance with company policies and legal requirements.",
    "No Monetary Claims from Clients: In the event of a breach of this Contract by either the Provider or Contractor, no monetary compensation or reimbursement shall be sought from the clients or their families.",
  ],
  "Intensive Individual Support Services(IISS)": [
    "Overseeing and managing the day-to-day operations of the IISS program.",
    "Providing leadership and guidance to a team of compassionate professionals, ensuring the delivery of top-tier services to individuals requiring specialized support.",
    "Collaborating closely with relevant stakeholders to meticulously plan and execute individualized support plans tailored to the unique needs of each participant.",
    "Continuously evaluating the efficacy of our services and implementing enhancements as necessary to ensure the highest standards of care.",
    "Additionally, as part of our commitment to upholding regulatory standards and ensuring the utmost integrity in our operations, we kindly ask that you adhere to the following clauses:",
    "Compliance with Medicaid Regulations: You are expected to comply with all pertinent Medicaid regulations and guidelines while fulfilling your duties under this Contract.",
    "Documentation of Service Delivery: It is imperative that you meticulously complete and maintain accurate written documentation of service delivery for each participant, on each day they receive services, capturing essential details such as service type, duration, and pertinent observations.",
    "No Monetary Claims from Participants or Families: In the unfortunate event of a breach of this Contract by either the Provider or Contractor, neither party shall seek any monetary compensation or reimbursement from the waiver participant or their family.",
  ],
};

// `
// you are a software engineer that is trying to generate a PDF like this one
// from the ReactTS part of the website. What is the best way to implement this in
// such a way where data input with be in this format  :  {
//   participant_name: "Somename ",
//   treatment_plan: "ISS Treatment plan",
//   basicInformation: {
//     participant_name: "Some",
//     age: "12",
//     fatherName: "father",
//     fatherMobile: "0901291282",
//     address: "some address",
//     state: "Town",
//     serviceCoordination: "soera",
//     tpPrepardBy: "",
//     implementation: "",
//     participantBackgroun: "",
//     ParticipantBackgroundInformation: "",
//     BehaviorInterventionProtocolAndRecommendation: "",
//     TransportationRequirementsRecommendation: "",
//   },

//   goals: [
//     {
//       targetSkill: " ",
//       shortTermObjective: "",
//       goalStatus: "",
//       goalComment: "",
//       goalBackground: "",
//       presentLevel: "",
//       targetlevel: "",
//       ofTrials: "",
//       frequency: "",
//       goalStatement: "",
//       setting: "",
//       taskAnalysis: "",
//       implementationProcedure: "",
//       evaluatingProgress: "",
//     },
//   ],
// };
// and know it to be dynamic
// `;

// const data = {
//   participant_name: "Somename ",
//   treatment_plan: "ISS Treatment plan",
//   basicInformation: {
//     participant_name: "Some",
//     age: "12",
//     fatherName: "father",
//     fatherMobile: "0901291282",
//     address: "some address",
//     state: "Town",
//     serviceCoordination: "soera",
//     tpPrepardBy: "",
//     implementation: "",
//     participantBackgroun: "",
//     ParticipantBackgroundInformation: "",
//     BehaviorInterventionProtocolAndRecommendation: "",
//     TransportationRequirementsRecommendation: "",
//   },

//   goals: [
//     {
//       targetSkill: " ",
//       shortTermObjective: "",
//       goalStatus: "",
//       goalComment: "",
//       goalBackground: "",
//       presentLevel: "",
//       targetlevel: "",
//       ofTrials: "",
//       frequency: "",
//       goalStatement: "",
//       setting: "",
//       taskAnalysis: "",
//       implementationProcedure: "",
//       evaluatingProgress: "",
//     },
//   ],
// };
