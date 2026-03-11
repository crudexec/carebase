// treatment-plan-pdf.js
const { format } = require("date-fns");
import { getTreatmentPlanFormName } from "@/utils/treatmentPlanHelpers";
import pdfMake from "pdfmake/build/pdfmake";

const formatDate = (date) => {
  return format(new Date(date), "MM/dd/yyyy");
};

async function convertUrlToDataUrl(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const createTreatmentPlanPDF = async (
  data,
  parentName,
  parentSignatureUrl,
  parentSignatureDate
) => {
  // Define styles
  const styles = {
    title: {
      fontSize: 14,
      bold: true,
      margin: [0, 0, 0, 4],
      decoration: "underline",
    },
    bigTitle: {
      fontSize: 14,
      bold: true,
      margin: [0, 0, 0, 4],
    },
    text: {
      fontSize: 11,
      margin: [0, 0, 0, 2],
    },
    softText: {
      fontSize: 11,
      margin: [0, 0, 0, 2],
    },
    boldText: {
      fontSize: 11,
      bold: true,
    },
    signatureTitle: {
      fontSize: 15,
      bold: true,
      decoration: "underline",
      margin: [0, 9, 0, 4],
    },
  };

  // Helper function to create basic information rows
  const createInfoRow = (header1, value1, header2, value2) => ({
    columns: [
      {
        width: "43%",
        columns: [
          { text: `${header1}: `, style: "boldText", width: "auto" },
          { text: value1 || "-", style: "softText", width: "*" },
        ],
      },
      {
        width: "43%",
        columns: [
          { text: `${header2}: `, style: "boldText", width: "auto" },
          { text: value2 || "-", style: "softText", width: "*" },
        ],
      },
    ],
    columnGap: 10,
    margin: [0, 0, 0, 5],
  });

  // Helper function to create goal text rows
  const createGoalRow = (header, value) => ({
    columns: [
      { text: `${header}: `, style: "boldText", width: "30%" },
      { text: value || "-", style: "softText", width: "70%" },
    ],
    columnGap: 10,
    margin: [0, 2, 0, 2],
  });

  // Build document definition
  const docDefinition = {
    content: [
      // Header section with logo and participant name
      {
        columns: [
          {
            image:
              "data:image/jpeg;base64,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",
            width: 120,
            height: 40,
            alignment: "left",
          },
          {
            stack: [
              {
                text: `Participant Name: ${data?.basicInformation?.participant_first_name} ${data?.basicInformation?.participant_last_name}`,
                style: "bigTitle",
                alignment: "right",
                margin: [20, 0, 0, 0],
              },
              {
                text: `Treatment Plan(TP) Type: ${getTreatmentPlanFormName(
                  data?.treatment_plan_type
                )}`,
                style: "bigTitle",
                alignment: "right",
                margin: [20, 5, 0, 0], // Added top margin for spacing
              },
            ],
            alignment: "right",
          },
        ],
        columnGap: 10,
        margin: [0, 0, 0, 25],
      },

      // Basic Information Section
      { text: "Basic Information", style: "title" },
      createInfoRow(
        "First Name",
        data?.basicInformation?.participant_first_name,
        "Last Name",
        data?.basicInformation?.participant_last_name
      ),
      createInfoRow(
        "Father Name",
        data?.basicInformation?.participant_father_name,
        "Mother Name",
        data?.basicInformation?.participant_mother_name
      ),
      createInfoRow(
        "Father Mobile Number",
        data?.basicInformation?.father_mobile_number,
        "Mother Mobile Number",
        data?.basicInformation?.mother_mobile_number
      ),
      createInfoRow(
        "Address",
        data?.basicInformation?.address_street_information,
        "City",
        data?.basicInformation?.city
      ),
      createInfoRow(
        "State",
        data?.basicInformation?.state,
        "Country",
        data?.basicInformation?.country
      ),
      // createInfoRow(
      //   "TP Implemented By",
      //   data?.basicInformation?.tp_implemented_by,
      //   "TP Type",
      //   data?.basicInformation?.tp_type
      // ),
      createInfoRow(
        "Implementation Start Date",
        data?.basicInformation?.implementation_start_date,
        "Implementation Stop Date",
        data?.basicInformation?.implementation_stop_date
      ),

      // Background Information Section
      {
        text: "Participant Background Information",
        style: "title",
        margin: [0, 15, 0, 4],
      },
      {
        text: data?.basicInformation?.participant_background_information || "-",
        style: "softText",
      },

      // Behavior Intervention Section
      {
        text: "Behavior Intervention Protocol And Recommendation",
        style: "title",
        margin: [0, 15, 0, 4],
      },
      {
        text: data?.basicInformation?.behavior_intervention_protocol || "-",
        style: "softText",
      },

      // Transportation Section
      {
        text: "Transportation Requirements & Recommendation",
        style: "title",
        margin: [0, 15, 0, 4],
      },
      {
        text:
          data?.basicInformation?.transport_requirements_and_recommendations ||
          "-",
        style: "softText",
      },

      // Family Strengths Section (conditional)
      ...(data?.basicInformation?.statement_of_family_strength_and_resources
        ? [
            {
              text: "Statement of family's strengths & resources",
              style: "title",
              margin: [0, 15, 0, 4],
            },
            {
              text: data?.basicInformation
                ?.statement_of_family_strength_and_resources,
              style: "softText",
            },
          ]
        : []),

      // Goals Section
      ...(data?.goals
        ?.map((goal, index) => [
          {
            text: `Goal ${index + 1}`,
            style: "title",
            margin: [0, 15, 0, 4],
          },
          createGoalRow("Goal Area", goal?.goal_area),
          createGoalRow("Target Skill", goal?.target_skill),
          createGoalRow("Short Term Objective", goal?.short_term_objective),
          createGoalRow("Goal Status", goal?.goal_status),
          createGoalRow("Goal Setting", goal?.goal_setting),
          createGoalRow("Number of Trials", goal?.number_of_trials?.toString()),
          createGoalRow("Goal Frequency", goal?.goal_frequency),
          createGoalRow("Current Skill Level", goal?.current_skill_level),
          createGoalRow(
            "Target Performance Level",
            goal?.target_performance_level
          ),
          createGoalRow("Goal Background", goal?.goal_background),
          createGoalRow("Goal Statement", goal?.goal_statement),
          createGoalRow(
            "Implementation Procedure",
            goal?.implementation_procedure
          ),
          ...(goal?.evaluating_progress?.length
            ? [
                createGoalRow(
                  "Evaluating Progress",
                  goal?.evaluating_progress.join(", ")
                ),
              ]
            : []),
          ...(goal?.progress_monitoring
            ? [createGoalRow("Progress Monitoring", goal?.progress_monitoring)]
            : []),
          ...(goal?.mastery_towards_goal_achievement
            ? [
                createGoalRow(
                  "Mastery towards goal achievement",
                  goal?.mastery_towards_goal_achievement
                ),
              ]
            : []),
          ...(goal?.reinforcers?.length
            ? [createGoalRow("Reinforcers", goal?.reinforcers.join(", "))]
            : []),
          ...(goal?.materials?.length
            ? [createGoalRow("Materials", goal?.materials.join(", "))]
            : []),
          ...(goal?.expected_outcome
            ? [createGoalRow("Expected Outcome", goal?.expected_outcome)]
            : []),
          ...(goal?.goal_comment
            ? [createGoalRow("Goal Comment (Optional)", goal?.goal_comment)]
            : []),
          // Task Analysis Section
          data?.treatment_plan_type === "IISS_Assessment" &&
          goal?.objective_term_steps?.length
            ? {
                columns: [
                  {
                    text: "Task Analysis: ",
                    style: "boldText",
                    width: "30%",
                  },
                  {
                    stack: goal?.objective_term_steps.map(
                      (step, stepIndex) => ({
                        stack: [
                          {
                            text: `Step ${stepIndex + 1}`,
                            style: "objectiveBold",
                            margin: [0, 3, 0, 2],
                          },
                          {
                            text: `- ${step?.task_analysis}`,
                            style: "objectiveSoft",
                          },
                          {
                            text: `- ${step?.baseline}`,
                            style: "objectiveSoft",
                            margin: [0, 0, 0, 3],
                          },
                        ],
                      })
                    ),
                    width: "70%",
                  },
                ],
                columnGap: 10,
              }
            : [],

          data?.treatment_plan_type === "FC_Assessment" &&
          goal?.objective_term_steps?.length
            ? {
                columns: [
                  {
                    text: "Teaching Methods/Strategies: ",
                    style: "boldText",
                    width: "30%",
                  },
                  {
                    stack: goal?.objective_term_steps.map(
                      (step, stepIndex) => ({
                        stack: [
                          {
                            text: `Strategy ${stepIndex + 1} = ${
                              step?.task_analysis
                            }`,
                            style: "objectiveBold",
                            margin: [0, 3, 0, 2],
                          },
                          {
                            text: `- ${step?.baseline}`,
                            style: "objectiveSoft",
                          },
                        ],
                      })
                    ),
                    width: "70%",
                  },
                ],
                columnGap: 10,
              }
            : [],
        ])
        .flat() || []),

      // Schedule Section
      {
        text: "Schedule",
        style: "title",
        margin: [0, 15, 0, 4],
      },
      ...(data?.schedule?.map((schedule) =>
        createGoalRow(
          schedule.day_of_week,
          `${schedule?.start_time} - ${schedule?.end_time}`
        )
      ) || []),

      // Signature Section
      ...(data?.treatmentGoalSignature
        ? [
            {
              text: "Signature",
              style: "signatureTitle",
              margin: [0, 30, 0, 15],
            },
            createGoalRow("Parent/Guardian name", parentName || ""),
            {
              columns: [
                { text: "Signature:", style: "boldText", width: "30%" },
                parentSignatureUrl
                  ? {
                      image: await convertUrlToDataUrl(
                        data?.treatmentGoalSignature?.parent_signature_url
                      ),
                      width: 120,
                      height: 40,
                    }
                  : { text: "", width: "70%" },
              ],
              columnGap: 10,
              margin: [0, 10, 0, 10],
            },
            createGoalRow(
              "Date",
              parentSignatureDate
                ? formatDate(new Date(parentSignatureDate))
                : ""
            ),
            createGoalRow(
              "Name of the person who prepared Treatment Plan(TP)",
              data?.treatmentGoalSignature?.full_name
            ),
            {
              columns: [
                { text: "Signature:", style: "boldText", width: "30%" },
                data?.treatmentGoalSignature?.signature_url
                  ? {
                      image: await convertUrlToDataUrl(
                        data?.treatmentGoalSignature?.signature_url
                      ),
                      width: 120,
                      height: 40,
                    }
                  : { text: "", width: "70%" },
              ],
              columnGap: 10,
              margin: [0, 10, 0, 10],
            },
            createGoalRow(
              "Date",
              data?.treatmentGoalSignature?.created_at
                ? formatDate(new Date(data?.treatmentGoalSignature?.created_at))
                : ""
            ),
          ]
        : []),
    ],
    styles: styles,
    defaultStyle: {
      font: "Roboto",
    },
  };

  pdfMake.fonts = {
    Roboto: {
      normal:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf",
      bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf",
    },
  };

  return docDefinition;
};
