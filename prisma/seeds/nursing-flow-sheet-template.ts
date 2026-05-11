import {
  AssessmentResponseType,
  AssessmentSectionType,
  Prisma,
  PrismaClient,
  ScoringMethod,
} from "@prisma/client";

type ItemInput = Prisma.AssessmentTemplateItemCreateWithoutSectionInput;
type SectionInput = Prisma.AssessmentTemplateSectionCreateWithoutTemplateInput;

function item(
  code: string,
  question: string,
  responseType: AssessmentResponseType,
  displayOrder: number,
  options: Partial<ItemInput> = {}
): ItemInput {
  return {
    code,
    question,
    responseType,
    displayOrder,
    isRequired: false,
    ...options,
  };
}

function multiChoiceOptions(values: string[]) {
  return values.map((value) => ({
    value: value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
    label: value,
  }));
}

function section(
  title: string,
  displayOrder: number,
  items: ItemInput[],
  options: Partial<SectionInput> = {}
): SectionInput {
  return {
    sectionType: AssessmentSectionType.CUSTOM,
    title,
    displayOrder,
    items: { create: items },
    ...options,
  };
}

export async function seedNursingFlowSheetTemplate(prisma: PrismaClient) {
  const templateName = "Nursing Flow Sheet";

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
    const itemCount = existingTemplate.sections.reduce(
      (count, current) => count + current.items.length,
      0
    );

    if (itemCount > 0) {
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

  const sections: SectionInput[] = [
    section(
      "Visit Information",
      0,
      [
        item("NFS_DOB", "Date of Birth", AssessmentResponseType.DATE, 0),
        item("NFS_CAREGIVER_NAME", "Caregiver", AssessmentResponseType.TEXT_SHORT, 1),
        item("NFS_VISIT_DATE", "Visit Date", AssessmentResponseType.DATE, 2),
        item("NFS_TIME_IN", "Time In", AssessmentResponseType.TIME, 3),
        item("NFS_TIME_OUT", "Time Out", AssessmentResponseType.TIME, 4),
        item("NFS_TOTAL_HOURS", "Total Hours", AssessmentResponseType.NUMBER, 5, {
          minValue: 0,
          maxValue: 24,
        }),
      ],
      {
        description: "Header details captured at the top of the nursing flow sheet.",
      }
    ),
    section(
      "Vital Signs",
      1,
      [
        item("NFS_VITAL_SIGNS_LOG", "Vital Signs Log", AssessmentResponseType.REPEATER, 0, {
          description:
            "Each row captures one vital-sign entry from the grid: time, temperature, pulse, respirations, blood pressure, and oxygen saturation.",
          responseOptions: {
            repeaterConfig: {
              itemLabel: "Vital Sign Entry",
              addButtonLabel: "Add Vital Sign Entry",
              minItems: 0,
              maxItems: 12,
              subFields: [
                { id: "time", label: "Time", type: "TIME", width: "third" },
                { id: "temperature", label: "Temperature", type: "NUMBER", width: "third" },
                { id: "pulse", label: "Pulse", type: "NUMBER", width: "third" },
                { id: "respirations", label: "Respirations", type: "NUMBER", width: "third" },
                { id: "bp", label: "B/P", type: "TEXT", width: "third" },
                { id: "o2_sats", label: "O2 Sats", type: "NUMBER", width: "third" },
              ],
            },
          },
        }),
      ],
      {
        sectionType: AssessmentSectionType.NURSING_VITALS,
        description: "Repeating vital-sign grid from the source flow sheet.",
      }
    ),
    section(
      "Neurological",
      2,
      [
        item("NFS_NEURO_MENTAL_STATUS", "Mental Status", AssessmentResponseType.MULTIPLE_CHOICE, 0, {
          responseOptions: multiChoiceOptions([
            "Alert",
            "Lethargic",
            "Sedated",
            "Comatose",
            "Semi-Comatose",
            "Verbal",
            "Nonverbal",
          ]),
        }),
        item("NFS_NEURO_SHUNT_PRESENT", "Shunt Present", AssessmentResponseType.YES_NO, 1),
        item("NFS_NEURO_SHUNT_TYPE", "Shunt Type", AssessmentResponseType.TEXT_SHORT, 2, {
          showIf: { itemCode: "NFS_NEURO_SHUNT_PRESENT", operator: "equals", value: true },
        }),
        item("NFS_NEURO_FINDINGS", "Neurological Findings", AssessmentResponseType.TEXT_LONG, 3),
        item("NFS_NEURO_SEIZURE_ACTIVITY", "Seizure Activity", AssessmentResponseType.YES_NO, 4),
        item("NFS_NEURO_SEIZURE_TYPE", "Seizure Type", AssessmentResponseType.TEXT_SHORT, 5, {
          showIf: { itemCode: "NFS_NEURO_SEIZURE_ACTIVITY", operator: "equals", value: true },
        }),
        item("NFS_NEURO_SEIZURE_DURATION", "Seizure Duration", AssessmentResponseType.TEXT_SHORT, 6, {
          showIf: { itemCode: "NFS_NEURO_SEIZURE_ACTIVITY", operator: "equals", value: true },
        }),
        item(
          "NFS_NEURO_SEIZURE_DOCUMENTATION",
          "Seizure Documentation Follow-up",
          AssessmentResponseType.MULTIPLE_CHOICE,
          7,
          {
            showIf: { itemCode: "NFS_NEURO_SEIZURE_ACTIVITY", operator: "equals", value: true },
            responseOptions: multiChoiceOptions([
              "Documented on SN Note/Seizure Log",
              "Followed Seizure Protocol",
            ]),
          }
        ),
      ],
      {
        sectionType: AssessmentSectionType.NURSING_NEUROLOGICAL,
      }
    ),
    section(
      "Physician Order Review",
      3,
      [
        item(
          "NFS_PHYSICIAN_ORDER_REVIEW",
          "Physician Order Review",
          AssessmentResponseType.MULTIPLE_CHOICE,
          0,
          {
            responseOptions: multiChoiceOptions([
              "485/POC Reviewed",
              "485/POC/Orders match MARS",
              "Update/Interim Reviewed",
              "Emergency protocol Reviewed",
            ]),
          }
        ),
      ]
    ),
    section(
      "Safety Precautions",
      4,
      [
        item(
          "NFS_SAFETY_PRECAUTIONS",
          "Safety Precautions",
          AssessmentResponseType.MULTIPLE_CHOICE,
          0,
          {
            responseOptions: multiChoiceOptions([
              "Universal Precautions",
              "Fall Precautions",
              "Aspiration Precautions",
              "Feeding Intolerance Precautions",
              "O2 Precautions",
              "Environmental Precautions",
              "Respiratory/Airway Precautions",
              "Seizure Precautions",
              "Other",
            ]),
          }
        ),
        item("NFS_SAFETY_PRECAUTIONS_OTHER", "Other Precaution Details", AssessmentResponseType.TEXT_SHORT, 1),
      ]
    ),
    section(
      "Cardiovascular",
      5,
      [
        item(
          "NFS_CARDIO_HEART_TONES",
          "Heart Tones",
          AssessmentResponseType.MULTIPLE_CHOICE,
          0,
          {
            responseOptions: multiChoiceOptions([
              "Strong",
              "Regular",
              "Irregular",
              "Murmur",
              "Other",
            ]),
          }
        ),
        item("NFS_CARDIO_HEART_TONES_OTHER", "Heart Tones Other Detail", AssessmentResponseType.TEXT_SHORT, 1),
        item(
          "NFS_CARDIO_COLOR",
          "Color",
          AssessmentResponseType.MULTIPLE_CHOICE,
          2,
          {
            responseOptions: multiChoiceOptions([
              "Pink",
              "Flushed",
              "Pale",
              "Dusky",
              "Cyanotic",
              "Jaundiced",
            ]),
          }
        ),
        item(
          "NFS_CARDIO_SKIN_TEMP",
          "Skin Temperature / Moisture",
          AssessmentResponseType.MULTIPLE_CHOICE,
          3,
          {
            responseOptions: multiChoiceOptions([
              "Warm",
              "Hot",
              "Cool",
              "Cold",
              "Diaphoretic",
              "Clammy",
            ]),
          }
        ),
        item("NFS_CARDIO_EDEMA_PRESENT", "Edema Present", AssessmentResponseType.YES_NO, 4),
        item("NFS_CARDIO_EDEMA_SITE", "Edema Site", AssessmentResponseType.TEXT_SHORT, 5, {
          showIf: { itemCode: "NFS_CARDIO_EDEMA_PRESENT", operator: "equals", value: true },
        }),
        item(
          "NFS_CARDIO_CAP_REFILL",
          "Capillary Refill",
          AssessmentResponseType.SINGLE_CHOICE,
          6,
          {
            responseOptions: [
              { value: "lt_3_sec", label: "<3 sec" },
              { value: "gt_3_sec", label: ">3 sec" },
            ],
          }
        ),
        item(
          "NFS_CARDIO_PERIPHERAL_PULSES",
          "Peripheral Pulses",
          AssessmentResponseType.MULTIPLE_CHOICE,
          7,
          {
            responseOptions: multiChoiceOptions(["Strong", "Bounding", "Weak", "Thready"]),
          }
        ),
      ]
    ),
    section(
      "Respiratory",
      6,
      [
        item(
          "NFS_RESP_STATUS",
          "Respiratory Status",
          AssessmentResponseType.MULTIPLE_CHOICE,
          0,
          {
            responseOptions: multiChoiceOptions([
              "Regular",
              "Labored",
              "Shallow",
              "Grunting",
              "Panting",
              "Nasal",
            ]),
          }
        ),
        item(
          "NFS_RESP_EFFORT_FINDINGS",
          "Respiratory Effort Findings",
          AssessmentResponseType.MULTIPLE_CHOICE,
          1,
          {
            responseOptions: multiChoiceOptions(["Flaring", "Retractions", "Deep", "Abdominal"]),
          }
        ),
        item(
          "NFS_RESP_BREATH_SOUNDS",
          "Breath Sounds",
          AssessmentResponseType.MULTIPLE_CHOICE,
          2,
          {
            responseOptions: multiChoiceOptions([
              "Clear",
              "Rales",
              "Rhonchi",
              "Diminished",
              "Wheeze",
            ]),
          }
        ),
        item("NFS_RESP_LOBES_IF_NOT_CLEAR", "If not clear specify lobe(s)", AssessmentResponseType.TEXT_SHORT, 3),
        item(
          "NFS_RESP_COUGH",
          "Cough",
          AssessmentResponseType.SINGLE_CHOICE,
          4,
          {
            responseOptions: [
              { value: "none", label: "None" },
              { value: "productive", label: "Productive" },
              { value: "non_productive", label: "Non-Productive" },
            ],
          }
        ),
        item(
          "NFS_RESP_SECRETIONS_CHARACTER",
          "Secretions",
          AssessmentResponseType.MULTIPLE_CHOICE,
          5,
          {
            responseOptions: multiChoiceOptions([
              "N/A",
              "Thin",
              "Thick",
              "Tenacious",
              "Frothy",
            ]),
          }
        ),
        item(
          "NFS_RESP_SECRETIONS_COLOR",
          "Secretions Color",
          AssessmentResponseType.MULTIPLE_CHOICE,
          6,
          {
            responseOptions: multiChoiceOptions([
              "Clear",
              "White",
              "Yellow",
              "Blood Tinged",
              "Green",
              "Tan",
            ]),
          }
        ),
        item("NFS_RESP_APNEA_MONITOR", "Apnea Monitor In Use", AssessmentResponseType.YES_NO, 7),
        item("NFS_RESP_APNEA_ALARM_HIGH", "Apnea Alarm Setting High", AssessmentResponseType.TEXT_SHORT, 8),
        item("NFS_RESP_APNEA_ALARM_LOW", "Apnea Alarm Setting Low", AssessmentResponseType.TEXT_SHORT, 9),
        item("NFS_RESP_APNEA_DELAY", "Apnea Delay", AssessmentResponseType.TEXT_SHORT, 10),
        item(
          "NFS_RESP_PULSE_OXIMETRY_MODE",
          "Pulse Oximetry",
          AssessmentResponseType.SINGLE_CHOICE,
          11,
          {
            responseOptions: [
              { value: "continual", label: "Continual" },
              { value: "intermittent", label: "Intermittent" },
            ],
          }
        ),
        item("NFS_RESP_PULSE_OX_ALARM_HIGH", "Pulse Ox Alarm Setting High", AssessmentResponseType.TEXT_SHORT, 12),
        item("NFS_RESP_PULSE_OX_ALARM_LOW", "Pulse Ox Alarm Setting Low", AssessmentResponseType.TEXT_SHORT, 13),
        item("NFS_RESP_OXYGEN_LPM", "Oxygen L/min", AssessmentResponseType.TEXT_SHORT, 14),
        item(
          "NFS_RESP_OXYGEN_ROUTE",
          "Oxygen Delivery Route",
          AssessmentResponseType.MULTIPLE_CHOICE,
          15,
          {
            responseOptions: multiChoiceOptions(["NC", "Mask", "Trach", "Intermittent"]),
          }
        ),
        item("NFS_RESP_O2_SATURATION", "O2 Saturation", AssessmentResponseType.NUMBER, 16, {
          minValue: 0,
          maxValue: 100,
        }),
        item("NFS_RESP_OXYGEN_OTHER", "Oxygen Other Detail", AssessmentResponseType.TEXT_SHORT, 17),
        item("NFS_RESP_O2_TANK_CHECKED", "O2 Tank checked for proper functioning", AssessmentResponseType.YES_NO, 18),
        item("NFS_RESP_BACKUP_TANK_SIZES", "Back Up O2 Tanks available Size(s)", AssessmentResponseType.TEXT_SHORT, 19),
      ]
    ),
    section(
      "Respiratory Care",
      7,
      [
        item("NFS_TRACH_PRESENT", "Tracheostomy Present", AssessmentResponseType.YES_NO, 0),
        item("NFS_TRACH_TYPE", "Tracheostomy Type", AssessmentResponseType.TEXT_SHORT, 1, {
          showIf: { itemCode: "NFS_TRACH_PRESENT", operator: "equals", value: true },
        }),
        item("NFS_TRACH_SIZE", "Tracheostomy Size", AssessmentResponseType.TEXT_SHORT, 2, {
          showIf: { itemCode: "NFS_TRACH_PRESENT", operator: "equals", value: true },
        }),
        item("NFS_TRACH_NA", "Respiratory Care N/A", AssessmentResponseType.YES_NO, 3),
        item(
          "NFS_TRACH_CUFF_STATUS",
          "Trach Cuff Status",
          AssessmentResponseType.SINGLE_CHOICE,
          4,
          {
            showIf: { itemCode: "NFS_TRACH_PRESENT", operator: "equals", value: true },
            responseOptions: [
              { value: "cuffed", label: "Cuffed" },
              { value: "uncuffed", label: "Uncuffed" },
            ],
          }
        ),
        item("NFS_TRACH_BACKUP_SIZES", "Back Up Trachs available Size(s)", AssessmentResponseType.TEXT_SHORT, 5),
        item("NFS_TRACH_DATE_LAST_CHANGED", "Date last changed", AssessmentResponseType.DATE, 6),
        item(
          "NFS_TRACH_CHANGED_BY",
          "Changed by",
          AssessmentResponseType.MULTIPLE_CHOICE,
          7,
          {
            responseOptions: multiChoiceOptions(["RN", "MD", "Parent"]),
          }
        ),
        item(
          "NFS_TRACH_CARE_METHOD",
          "Trach Care Method",
          AssessmentResponseType.MULTIPLE_CHOICE,
          8,
          {
            responseOptions: multiChoiceOptions([
              "1/2 Strength H2O2 + H2O",
              "NS",
              "Warm Soapy H2O",
            ]),
          }
        ),
        item("NFS_TRACH_TIES_CHANGED", "Trach Ties Changed", AssessmentResponseType.YES_NO, 9),
        item("NFS_TRACH_INNER_CANNULA_CHANGED", "Inner Cannula Changed", AssessmentResponseType.YES_NO, 10),
        item("NFS_TRACH_CARE_DATES", "Trach Care Date(s)", AssessmentResponseType.LIST, 11, {
          responseOptions: {
            listConfig: {
              itemType: "DATE",
              itemLabel: "Trach Care Date",
              maxItems: 10,
            },
          },
        }),
        item(
          "NFS_TRACH_SITE",
          "Trach Site",
          AssessmentResponseType.MULTIPLE_CHOICE,
          12,
          {
            responseOptions: multiChoiceOptions([
              "Dry",
              "Intact",
              "Redness",
              "Excoriation",
              "Drainage",
              "Odor",
            ]),
          }
        ),
        item("NFS_TRACH_VENTILATOR", "Ventilator", AssessmentResponseType.YES_NO, 13),
        item("NFS_TRACH_VENT_TYPES", "Ventilator Type(s)", AssessmentResponseType.TEXT_SHORT, 14),
        item("NFS_TRACH_VENT_HOURS_PER_DAY", "Hrs/Day on Ventilator", AssessmentResponseType.TEXT_SHORT, 15),
        item("NFS_TRACH_VENT_MODE", "Ventilator Settings Mode", AssessmentResponseType.TEXT_SHORT, 16),
        item("NFS_TRACH_VENT_RATE", "Ventilator Rate", AssessmentResponseType.TEXT_SHORT, 17),
        item("NFS_TRACH_VENT_PC", "Ventilator PC", AssessmentResponseType.TEXT_SHORT, 18),
        item("NFS_TRACH_VENT_PEEP", "Ventilator PEEP", AssessmentResponseType.TEXT_SHORT, 19),
        item("NFS_TRACH_VENT_PS", "Ventilator PS", AssessmentResponseType.TEXT_SHORT, 20),
        item("NFS_TRACH_VENT_INSP_TIME", "Ventilator Insp Time", AssessmentResponseType.TEXT_SHORT, 21),
        item("NFS_TRACH_VENT_FIO2", "Ventilator FIO2", AssessmentResponseType.TEXT_SHORT, 22),
        item("NFS_TRACH_VENT_HI_PRESSURE_ALARM", "Hi Pressure Alarm", AssessmentResponseType.TEXT_SHORT, 23),
        item("NFS_TRACH_VENT_LOW_PRESSURE_ALARM", "Low Pressure Alarm", AssessmentResponseType.TEXT_SHORT, 24),
        item("NFS_TRACH_CPAP", "CPAP", AssessmentResponseType.YES_NO, 25),
        item("NFS_TRACH_CPAP_SET_AT", "CPAP Set at", AssessmentResponseType.TEXT_SHORT, 26),
        item("NFS_TRACH_CPAP_CM_H2O", "CPAP cm water pressure", AssessmentResponseType.TEXT_SHORT, 27),
        item("NFS_TRACH_ALARM_CHECKED", "Alarm Checked", AssessmentResponseType.YES_NO, 28),
        item("NFS_TRACH_AUDIBLE_SET_AT", "Audible/Set At", AssessmentResponseType.TEXT_SHORT, 29),
        item("NFS_TRACH_ALARM_HIGH", "Alarm High", AssessmentResponseType.TEXT_SHORT, 30),
        item("NFS_TRACH_ALARM_LOW", "Alarm Low", AssessmentResponseType.TEXT_SHORT, 31),
        item("NFS_TRACH_EQUIPMENT_CLEANED", "Equipment Cleaned", AssessmentResponseType.YES_NO, 32),
        item("NFS_TRACH_VENT_SETTINGS_CHECKED", "Vent settings checked", AssessmentResponseType.YES_NO, 33),
        item("NFS_TRACH_NEB_TREATMENT_GIVEN", "NEB Treatment given", AssessmentResponseType.YES_NO, 34),
        item(
          "NFS_TRACH_NEB_RESPONSE",
          "NEB Treatment Response",
          AssessmentResponseType.SINGLE_CHOICE,
          35,
          {
            responseOptions: [
              { value: "effective", label: "Effective" },
              { value: "not_effective", label: "Not Effective" },
            ],
          }
        ),
        item("NFS_TRACH_NEB_RESPONSE_EXPLAIN", "Not Effective (Explain)", AssessmentResponseType.TEXT_LONG, 36, {
          showIf: {
            itemCode: "NFS_TRACH_NEB_RESPONSE",
            operator: "equals",
            value: "not_effective",
          },
        }),
      ]
    ),
    section(
      "Gastrointestinal",
      8,
      [
        item(
          "NFS_GI_ABDOMEN",
          "Abdomen",
          AssessmentResponseType.MULTIPLE_CHOICE,
          0,
          {
            responseOptions: multiChoiceOptions(["Soft", "Tense", "Flat", "Distended"]),
          }
        ),
        item(
          "NFS_GI_BOWEL_SOUNDS",
          "Bowel Sounds",
          AssessmentResponseType.MULTIPLE_CHOICE,
          1,
          {
            responseOptions: multiChoiceOptions(["Present", "Hyper", "Hypo", "Absent"]),
          }
        ),
        item(
          "NFS_GI_FEEDING_TUBE_TYPE",
          "Feeding Tube Type",
          AssessmentResponseType.MULTIPLE_CHOICE,
          2,
          {
            responseOptions: multiChoiceOptions([
              "N/A",
              "NG",
              "J tube",
              "G tube",
              "Other",
              "Mickey Button",
            ]),
          }
        ),
        item("NFS_GI_FEEDING_TUBE_OTHER", "Feeding Tube Other Detail", AssessmentResponseType.TEXT_SHORT, 3),
        item(
          "NFS_GI_FEEDING_TUBE_CARE",
          "Feeding Tube Care",
          AssessmentResponseType.MULTIPLE_CHOICE,
          4,
          {
            responseOptions: multiChoiceOptions([
              "1/2 Strength H2O2 + H2O",
              "NS",
              "Warm Soapy H2O",
            ]),
          }
        ),
        item("NFS_GI_GTUBE_SIZE", "GT Tube Size", AssessmentResponseType.TEXT_SHORT, 5),
        item("NFS_GI_DATE_LAST_CHANGED", "Date Last Changed", AssessmentResponseType.DATE, 6),
        item(
          "NFS_GI_CHANGED_BY",
          "Changed by",
          AssessmentResponseType.MULTIPLE_CHOICE,
          7,
          {
            responseOptions: multiChoiceOptions(["RN", "MD", "Parent"]),
          }
        ),
        item("NFS_GI_FEEDING_AMOUNT", "Amount", AssessmentResponseType.TEXT_SHORT, 8),
        item("NFS_GI_FEEDING_FREQUENCY", "Frequency", AssessmentResponseType.TEXT_SHORT, 9),
        item("NFS_GI_FLUSH_SOLUTION", "Flushes Solution", AssessmentResponseType.TEXT_SHORT, 10),
        item(
          "NFS_GI_GT_SITE",
          "GT Site",
          AssessmentResponseType.MULTIPLE_CHOICE,
          11,
          {
            responseOptions: multiChoiceOptions([
              "Dry",
              "Intact",
              "Redness",
              "Excoriation",
              "Drainage",
              "No S/S of infection",
              "Other",
            ]),
          }
        ),
        item("NFS_GI_GT_SITE_OTHER", "GT Site Other Detail", AssessmentResponseType.TEXT_SHORT, 12),
        item("NFS_GI_RESIDUAL_AMOUNT", "Residual Amount", AssessmentResponseType.TEXT_SHORT, 13),
        item("NFS_GI_PLACEMENT_RESIDUAL_CHECKED", "Placement & Residual Checked", AssessmentResponseType.YES_NO, 14),
      ]
    ),
    section(
      "Genito-Urinary",
      9,
      [
        item(
          "NFS_GU_URINE_APPEARANCE",
          "Urine",
          AssessmentResponseType.MULTIPLE_CHOICE,
          0,
          {
            responseOptions: multiChoiceOptions([
              "Clear",
              "Cloudy",
              "Sediment",
              "Blood",
              "Odor",
              "Other",
            ]),
          }
        ),
        item("NFS_GU_URINE_OTHER", "Urine Other Detail", AssessmentResponseType.TEXT_SHORT, 1),
        item("NFS_GU_ABNORMAL_FINDINGS", "Abnormal Findings", AssessmentResponseType.TEXT_LONG, 2),
        item(
          "NFS_GU_CONTINENCE",
          "Continence",
          AssessmentResponseType.MULTIPLE_CHOICE,
          3,
          {
            responseOptions: multiChoiceOptions([
              "Continent",
              "Incontinent",
              "Age appropriate continence/incontinence",
            ]),
          }
        ),
        item(
          "NFS_GU_INVOLVES",
          "Incontinence Involves",
          AssessmentResponseType.MULTIPLE_CHOICE,
          4,
          {
            responseOptions: multiChoiceOptions(["Bowel", "Bladder"]),
          }
        ),
        item(
          "NFS_GU_CATHETER_TYPE",
          "Catheter Type",
          AssessmentResponseType.MULTIPLE_CHOICE,
          5,
          {
            responseOptions: multiChoiceOptions(["Foley", "Suprapubic", "Intermittent"]),
          }
        ),
        item("NFS_GU_CATHETER_SIZE", "Catheter Size", AssessmentResponseType.TEXT_SHORT, 6),
        item("NFS_GU_DATE_LAST_CHANGED", "Date Last Changed", AssessmentResponseType.DATE, 7),
        item(
          "NFS_GU_CHANGED_BY",
          "Changed by",
          AssessmentResponseType.MULTIPLE_CHOICE,
          8,
          {
            responseOptions: multiChoiceOptions(["RN", "MD", "Parent"]),
          }
        ),
      ]
    ),
    section(
      "Intravenous",
      10,
      [
        item(
          "NFS_IV_ACCESS",
          "Access",
          AssessmentResponseType.MULTIPLE_CHOICE,
          0,
          {
            responseOptions: multiChoiceOptions(["N/A", "Peripheral", "CVL", "PICC", "Port (Site)"]),
          }
        ),
        item("NFS_IV_PORT_SITE", "Port Site", AssessmentResponseType.TEXT_SHORT, 1),
        item(
          "NFS_IV_SITE_STATUS",
          "IV Site Status",
          AssessmentResponseType.MULTIPLE_CHOICE,
          2,
          {
            responseOptions: multiChoiceOptions(["Intact", "Redness", "Inflammation"]),
          }
        ),
        item("NFS_IV_DRESSING_CHANGE_DUE", "Dressing Change Due (Date)", AssessmentResponseType.DATE, 3),
        item("NFS_IV_DRESSING_CHANGED", "Dressing Changed", AssessmentResponseType.YES_NO, 4),
        item("NFS_IV_LABS_DRAWN", "Labs Drawn", AssessmentResponseType.YES_NO, 5),
        item("NFS_IV_LABS_SPECIFY_TESTS", "Labs Drawn (Specify Tests)", AssessmentResponseType.TEXT_SHORT, 6, {
          showIf: { itemCode: "NFS_IV_LABS_DRAWN", operator: "equals", value: true },
        }),
        item("NFS_IV_TIME", "IV Time", AssessmentResponseType.TIME, 7),
        item("NFS_IV_SITE_USED", "Site Used", AssessmentResponseType.TEXT_SHORT, 8),
        item("NFS_IV_FASTING_LABS_LOGISTICS", "Fasting Labs taken to/Picked up by", AssessmentResponseType.TEXT_SHORT, 9),
      ]
    ),
    section(
      "Nutritional Assessment",
      11,
      [
        item(
          "NFS_NUTRITION_DIET",
          "Diet",
          AssessmentResponseType.MULTIPLE_CHOICE,
          0,
          {
            responseOptions: multiChoiceOptions(["Regular", "PO", "NPO", "TF", "Other"]),
          }
        ),
        item("NFS_NUTRITION_DIET_OTHER", "Diet Other Detail", AssessmentResponseType.TEXT_SHORT, 1),
        item("NFS_NUTRITION_FORMULA_TYPE", "Formula Type", AssessmentResponseType.TEXT_SHORT, 2),
        item("NFS_NUTRITION_AMOUNT", "Amount", AssessmentResponseType.TEXT_SHORT, 3),
        item("NFS_NUTRITION_FREQUENCY", "Frequency", AssessmentResponseType.TEXT_SHORT, 4),
        item(
          "NFS_NUTRITION_DELIVERY_MODE",
          "Delivery Mode",
          AssessmentResponseType.MULTIPLE_CHOICE,
          5,
          {
            responseOptions: multiChoiceOptions(["Bolus", "Continuous"]),
          }
        ),
        item("NFS_NUTRITION_RATE", "Rate (ml/hr)", AssessmentResponseType.TEXT_SHORT, 6),
        item(
          "NFS_NUTRITION_APPETITE",
          "Appetite",
          AssessmentResponseType.SINGLE_CHOICE,
          7,
          {
            responseOptions: [
              { value: "good", label: "Good" },
              { value: "fair", label: "Fair" },
              { value: "poor", label: "Poor" },
            ],
          }
        ),
        item("NFS_NUTRITION_FLUID_RESTRICTED", "Fluid Restriction", AssessmentResponseType.YES_NO, 8),
        item("NFS_NUTRITION_FLUID_RESTRICTION_EXPLAIN", "Fluid Restriction (Explain)", AssessmentResponseType.TEXT_SHORT, 9, {
          showIf: { itemCode: "NFS_NUTRITION_FLUID_RESTRICTED", operator: "equals", value: true },
        }),
        item("NFS_NUTRITION_NO_RESTRICTION", "No Restriction", AssessmentResponseType.YES_NO, 10),
        item("NFS_NUTRITION_DIABETIC", "Diabetic", AssessmentResponseType.YES_NO, 11),
        item("NFS_NUTRITION_FINGER_STICKS_READING", "Finger Sticks Reading", AssessmentResponseType.TEXT_SHORT, 12),
        item(
          "NFS_NUTRITION_SCREENING_RISK",
          "Nutritional Screening Risk",
          AssessmentResponseType.SINGLE_CHOICE,
          13,
          {
            responseOptions: [
              { value: "low", label: "LOW" },
              { value: "medium", label: "MEDIUM" },
              { value: "high", label: "HIGH" },
            ],
          }
        ),
        item("NFS_NUTRITION_TIME", "Nutritional Assessment Time", AssessmentResponseType.TIME, 14),
      ],
      {
        sectionType: AssessmentSectionType.NUTRITION,
      }
    ),
    section(
      "Patient Education",
      12,
      [
        item("NFS_EDUCATION_TOPIC", "Teaching provided (Topic)", AssessmentResponseType.TEXT_LONG, 0),
        item(
          "NFS_EDUCATION_AUDIENCE",
          "Educated",
          AssessmentResponseType.MULTIPLE_CHOICE,
          1,
          {
            responseOptions: multiChoiceOptions(["Patient", "Family", "Primary caregiver", "Other"]),
          }
        ),
        item("NFS_EDUCATION_AUDIENCE_OTHER", "Educated Other Detail", AssessmentResponseType.TEXT_SHORT, 2),
        item(
          "NFS_EDUCATION_METHOD",
          "Method",
          AssessmentResponseType.MULTIPLE_CHOICE,
          3,
          {
            responseOptions: multiChoiceOptions(["Discussion", "Demo", "Handout", "Video", "Other"]),
          }
        ),
        item("NFS_EDUCATION_METHOD_OTHER", "Method Other Detail", AssessmentResponseType.TEXT_SHORT, 4),
        item(
          "NFS_EDUCATION_UNDERSTANDING",
          "Level of Understanding",
          AssessmentResponseType.SINGLE_CHOICE,
          5,
          {
            responseOptions: [
              { value: "good", label: "Good" },
              { value: "fair", label: "Fair" },
              { value: "poor", label: "Poor" },
              { value: "needs_reinforcement", label: "Needs Reinforcement" },
            ],
          }
        ),
        item(
          "NFS_EDUCATION_EVALUATION_METHOD",
          "Evaluation Method",
          AssessmentResponseType.MULTIPLE_CHOICE,
          6,
          {
            responseOptions: multiChoiceOptions(["Verbal", "Return Demonstration"]),
          }
        ),
        item(
          "NFS_EDUCATION_KNOWLEDGE_GAPS",
          "Lacks knowledge of",
          AssessmentResponseType.MULTIPLE_CHOICE,
          7,
          {
            responseOptions: multiChoiceOptions([
              "Equipment",
              "Therapies",
              "Medication",
              "Disease Management",
              "Diet",
              "Other",
            ]),
          }
        ),
        item("NFS_EDUCATION_KNOWLEDGE_GAPS_OTHER", "Lacks knowledge of Other Detail", AssessmentResponseType.TEXT_SHORT, 8),
      ]
    ),
    section(
      "Pain Assessment",
      13,
      [
        item("NFS_PAIN_PRESENT", "Pain", AssessmentResponseType.YES_NO, 0),
        item("NFS_PAIN_VERBAL_COMPLAINT", "Verbal Complaint", AssessmentResponseType.YES_NO, 1, {
          showIf: { itemCode: "NFS_PAIN_PRESENT", operator: "equals", value: true },
        }),
        item(
          "NFS_PAIN_BEHAVIORS",
          "Pain Behaviors",
          AssessmentResponseType.MULTIPLE_CHOICE,
          2,
          {
            showIf: { itemCode: "NFS_PAIN_PRESENT", operator: "equals", value: true },
            responseOptions: multiChoiceOptions([
              "Moaning",
              "Crying",
              "Anxiety",
              "Grinding Teeth",
              "Restless",
              "Irritable",
              "Abdominal Guarding",
              "Facial Grimacing",
            ]),
          }
        ),
        item("NFS_PAIN_INTERVENTION_PERFORMED", "Intervention Performed", AssessmentResponseType.YES_NO, 3, {
          showIf: { itemCode: "NFS_PAIN_PRESENT", operator: "equals", value: true },
        }),
        item("NFS_PAIN_INTERVENTION_EXPLAIN", "Intervention (Explain)", AssessmentResponseType.TEXT_LONG, 4, {
          showIf: {
            itemCode: "NFS_PAIN_INTERVENTION_PERFORMED",
            operator: "equals",
            value: true,
          },
        }),
      ],
      {
        sectionType: AssessmentSectionType.PAIN,
      }
    ),
    section(
      "Discharge Planning",
      14,
      [
        item("NFS_DISCHARGE_NA", "Discharge Planning N/A", AssessmentResponseType.YES_NO, 0),
        item("NFS_DISCHARGE_DATE", "Discharge Date", AssessmentResponseType.DATE, 1),
        item("NFS_DISCHARGE_REVIEWED", "Reviewed", AssessmentResponseType.YES_NO, 2),
        item("NFS_DISCHARGE_REVIEWED_WITH", "Reviewed (Reviewee with)", AssessmentResponseType.TEXT_SHORT, 3, {
          showIf: { itemCode: "NFS_DISCHARGE_REVIEWED", operator: "equals", value: true },
        }),
        item("NFS_DISCHARGE_CONSULTS_NEEDED", "Consults Needed", AssessmentResponseType.YES_NO, 4),
        item("NFS_DISCHARGE_CONSULTS_EXPLAIN", "Consults Needed (Explain)", AssessmentResponseType.TEXT_LONG, 5, {
          showIf: {
            itemCode: "NFS_DISCHARGE_CONSULTS_NEEDED",
            operator: "equals",
            value: true,
          },
        }),
      ]
    ),
    section(
      "Physician Notification",
      15,
      [
        item("NFS_MD_NOTIFICATION_NA", "Physician Notification N/A", AssessmentResponseType.YES_NO, 0),
        item("NFS_MD_CALLED", "MD Called", AssessmentResponseType.YES_NO, 1),
        item("NFS_MD_CALLED_TIME", "MD Called Time", AssessmentResponseType.TIME, 2),
        item("NFS_MD_SPOKE_WITH", "Spoke with", AssessmentResponseType.TEXT_SHORT, 3),
        item("NFS_MD_DISCUSSED", "Discussed", AssessmentResponseType.TEXT_LONG, 4),
        item(
          "NFS_MD_NOTIFICATION_OUTCOME",
          "Physician Notification Outcome",
          AssessmentResponseType.MULTIPLE_CHOICE,
          5,
          {
            responseOptions: multiChoiceOptions([
              "No new orders",
              "Orders received",
              "Verbal Order attached",
              "MD to return call",
            ]),
          }
        ),
      ]
    ),
    section(
      "Visit Documentation / Shift Summary",
      16,
      [
        item("NFS_SHIFT_SUMMARY", "Visit Documentation/Shift Summary", AssessmentResponseType.TEXT_LONG, 0),
      ]
    ),
    section(
      "Footer / Sign-Off",
      17,
      [
        item("NFS_REPORTED_OFF_TO", "Reported off to", AssessmentResponseType.TEXT_SHORT, 0),
        item("NFS_PATIENT_LEFT_IN_CARE_OF", "Patient left in care of", AssessmentResponseType.TEXT_SHORT, 1),
        item("NFS_CAREGIVER_SIGNATURE", "Caregiver Signature", AssessmentResponseType.SIGNATURE, 2),
      ]
    ),
  ];

  const template = await prisma.assessmentTemplate.create({
    data: {
      name: templateName,
      description:
        "Full nursing flow sheet assessment template reconstructed from the provided screenshots, including visit metadata, systems review, respiratory care, G-tube, GU, IV, education, pain, discharge planning, and shift summary.",
      version: 1,
      isActive: true,
      isRequired: false,
      displayOrder: 12,
      scoringMethod: ScoringMethod.CUSTOM,
      sections: {
        create: sections,
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
      (count, current) => count + current.items.length,
      0
    )} items`
  );

  return template;
}
