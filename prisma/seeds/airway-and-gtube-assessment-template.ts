import {
  AssessmentResponseType,
  AssessmentSectionType,
  PrismaClient,
  ScoringMethod,
} from "@prisma/client";

export async function seedAirwayAndGTubeAssessmentTemplate(prisma: PrismaClient) {
  const templateName = "G-Tube, Respiratory & Tracheostomy Assessment";

  console.log(`Creating assessment template: ${templateName}`);

  const existingTemplate = await prisma.assessmentTemplate.findFirst({
    where: {
      name: templateName,
      companyId: null,
      stateConfigId: null,
    },
    include: {
      sections: {
        include: {
          items: true,
        },
      },
    },
  });

  if (existingTemplate) {
    const existingItemCount = existingTemplate.sections.reduce(
      (count, section) => count + section.items.length,
      0
    );

    if (existingItemCount > 0) {
      console.log(`  ⏭️  Template ${templateName} already exists, skipping...`);
      return existingTemplate;
    }

    const assessmentCount = await prisma.assessment.count({
      where: { templateId: existingTemplate.id },
    });

    if (assessmentCount > 0) {
      console.log(
        `  ⏭️  Template ${templateName} exists and is already in use, skipping recreation...`
      );
      return existingTemplate;
    }

    await prisma.assessmentTemplate.delete({
      where: { id: existingTemplate.id },
    });
  }

  const template = await prisma.assessmentTemplate.create({
    data: {
      name: templateName,
      description:
        "Focused skilled nursing assessment for enteral feeding, respiratory status, and tracheostomy care needs.",
      version: 1,
      isActive: true,
      isRequired: false,
      displayOrder: 11,
      scoringMethod: ScoringMethod.CUSTOM,
      sections: {
        create: [
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Gtube Assessment",
            description: "Assessment of enteral feeding tube status, site condition, and tolerance.",
            instructions:
              "Document the tube type, site condition, feeding regimen, and any complications or caregiver concerns.",
            displayOrder: 0,
            items: {
              create: [
                {
                  code: "GTUBE_PRESENT",
                  question: "G-tube present?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 0,
                },
                {
                  code: "GTUBE_TYPE",
                  question: "G-tube type",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: false,
                  displayOrder: 1,
                  showIf: { itemCode: "GTUBE_PRESENT", operator: "equals", value: true },
                  responseOptions: [
                    { value: "peg", label: "PEG tube" },
                    { value: "mic_key", label: "MIC-KEY button" },
                    { value: "jejunostomy", label: "GJ/J tube" },
                    { value: "other", label: "Other" },
                  ],
                },
                {
                  code: "GTUBE_SITE_CONDITION",
                  question: "Site condition",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  isRequired: false,
                  displayOrder: 2,
                  showIf: { itemCode: "GTUBE_PRESENT", operator: "equals", value: true },
                  responseOptions: [
                    { value: "clean_dry", label: "Clean and dry" },
                    { value: "redness", label: "Redness" },
                    { value: "drainage", label: "Drainage" },
                    { value: "crusting", label: "Crusting" },
                    { value: "odor", label: "Odor" },
                    { value: "granulation", label: "Granulation tissue" },
                    { value: "pain", label: "Pain/tenderness" },
                  ],
                },
                {
                  code: "GTUBE_FEEDING_REGIMEN",
                  question: "Feeding regimen",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  isRequired: false,
                  displayOrder: 3,
                  showIf: { itemCode: "GTUBE_PRESENT", operator: "equals", value: true },
                  description: "Include formula, rate, volume, water flushes, and schedule.",
                },
                {
                  code: "GTUBE_TOLERANCE",
                  question: "Feeding tolerance",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: false,
                  displayOrder: 4,
                  showIf: { itemCode: "GTUBE_PRESENT", operator: "equals", value: true },
                  responseOptions: [
                    { value: "good", label: "Good tolerance" },
                    { value: "fair", label: "Fair tolerance" },
                    { value: "poor", label: "Poor tolerance" },
                  ],
                },
                {
                  code: "GTUBE_COMPLICATIONS",
                  question: "Complications noted",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  isRequired: false,
                  displayOrder: 5,
                  showIf: { itemCode: "GTUBE_PRESENT", operator: "equals", value: true },
                  description: "Document leakage, clogging, dislodgement, skin breakdown, emesis, or aspiration concerns.",
                },
              ],
            },
          },
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Respiratory Assessment",
            description: "Assessment of respiratory effort, oxygenation, and breath sounds.",
            instructions:
              "Assess the patient at rest unless otherwise indicated. Document oxygen use, symptoms, and any changes from baseline.",
            displayOrder: 1,
            items: {
              create: [
                {
                  code: "RESP_RATE",
                  question: "Respiratory rate",
                  responseType: AssessmentResponseType.NUMBER,
                  isRequired: true,
                  displayOrder: 0,
                  minValue: 0,
                  maxValue: 80,
                },
                {
                  code: "RESP_EFFORT",
                  question: "Respiratory effort",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: true,
                  displayOrder: 1,
                  responseOptions: [
                    { value: "unlabored", label: "Unlabored" },
                    { value: "mild_labored", label: "Mildly labored" },
                    { value: "moderate_labored", label: "Moderately labored" },
                    { value: "severe_labored", label: "Severely labored" },
                  ],
                },
                {
                  code: "RESP_BREATH_SOUNDS",
                  question: "Breath sounds",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  isRequired: true,
                  displayOrder: 2,
                  responseOptions: [
                    { value: "clear", label: "Clear" },
                    { value: "diminished", label: "Diminished" },
                    { value: "crackles", label: "Crackles" },
                    { value: "wheezes", label: "Wheezes" },
                    { value: "rhonchi", label: "Rhonchi" },
                    { value: "stridor", label: "Stridor" },
                  ],
                },
                {
                  code: "RESP_OXYGEN_IN_USE",
                  question: "Supplemental oxygen in use?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 3,
                },
                {
                  code: "RESP_OXYGEN_DETAILS",
                  question: "Oxygen details",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  isRequired: false,
                  displayOrder: 4,
                  showIf: {
                    itemCode: "RESP_OXYGEN_IN_USE",
                    operator: "equals",
                    value: true,
                  },
                  description: "Document device and liters per minute.",
                },
                {
                  code: "RESP_O2_SAT",
                  question: "Oxygen saturation (%)",
                  responseType: AssessmentResponseType.NUMBER,
                  isRequired: false,
                  displayOrder: 5,
                  minValue: 0,
                  maxValue: 100,
                },
                {
                  code: "RESP_SYMPTOMS",
                  question: "Respiratory symptoms",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  isRequired: false,
                  displayOrder: 6,
                  responseOptions: [
                    { value: "none", label: "None" },
                    { value: "cough", label: "Cough" },
                    { value: "sputum", label: "Sputum production" },
                    { value: "sob", label: "Shortness of breath" },
                    { value: "orthopnea", label: "Orthopnea" },
                    { value: "chest_tightness", label: "Chest tightness" },
                  ],
                },
              ],
            },
          },
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Tracheostomy assessment",
            description: "Assessment of tracheostomy site, equipment, and airway management.",
            instructions:
              "Document tracheostomy status, site condition, secretion management, and emergency readiness.",
            displayOrder: 2,
            items: {
              create: [
                {
                  code: "TRACH_PRESENT",
                  question: "Tracheostomy present?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 0,
                },
                {
                  code: "TRACH_TYPE",
                  question: "Tracheostomy tube type",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  isRequired: false,
                  displayOrder: 1,
                  showIf: { itemCode: "TRACH_PRESENT", operator: "equals", value: true },
                  description: "Document cuffed/uncuffed, size, and brand if known.",
                },
                {
                  code: "TRACH_SITE_CONDITION",
                  question: "Stoma/site condition",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  isRequired: false,
                  displayOrder: 2,
                  showIf: { itemCode: "TRACH_PRESENT", operator: "equals", value: true },
                  responseOptions: [
                    { value: "clean_dry", label: "Clean and dry" },
                    { value: "redness", label: "Redness" },
                    { value: "drainage", label: "Drainage" },
                    { value: "bleeding", label: "Bleeding" },
                    { value: "odor", label: "Odor" },
                    { value: "skin_breakdown", label: "Skin breakdown" },
                  ],
                },
                {
                  code: "TRACH_SECRETIONS",
                  question: "Secretions",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: false,
                  displayOrder: 3,
                  showIf: { itemCode: "TRACH_PRESENT", operator: "equals", value: true },
                  responseOptions: [
                    { value: "none", label: "None/minimal" },
                    { value: "thin_clear", label: "Thin/clear" },
                    { value: "thick_white", label: "Thick/white" },
                    { value: "yellow_green", label: "Yellow/green" },
                    { value: "bloody", label: "Bloody" },
                  ],
                },
                {
                  code: "TRACH_SUCTIONING_REQUIRED",
                  question: "Suctioning required?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: false,
                  displayOrder: 4,
                  showIf: { itemCode: "TRACH_PRESENT", operator: "equals", value: true },
                },
                {
                  code: "TRACH_SUPPLIES_AVAILABLE",
                  question: "Emergency trach supplies available at bedside/home?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: false,
                  displayOrder: 5,
                  showIf: { itemCode: "TRACH_PRESENT", operator: "equals", value: true },
                },
                {
                  code: "TRACH_NOTES",
                  question: "Tracheostomy care notes",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  isRequired: false,
                  displayOrder: 6,
                  showIf: { itemCode: "TRACH_PRESENT", operator: "equals", value: true },
                  description:
                    "Document trach care completed, patient tolerance, teaching, and any follow-up needs.",
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      sections: {
        include: {
          items: true,
        },
      },
    },
  });

  console.log(
    `  ✅ Created ${template.name} with ${template.sections.length} sections and ${template.sections.reduce(
      (count, section) => count + section.items.length,
      0
    )} items`
  );

  return template;
}
