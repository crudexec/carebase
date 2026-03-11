"use client";
/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { formatDate } from "@/utils";
import { EyeIcon } from "@/components/icons";
import { z } from "zod";
import { useGlobalState } from "@/context/global-state";
import { TreatmentPlanDownloadIcon } from "@/components/icons/DownloadIcon";
import Link from "next/link";
import Loader from "@/components/Loader";
import { createTreatmentPlanPDF } from "@/lib/pdf/treatmentPlanPdf";
import pdfMake from "pdfmake/build/pdfmake";
import { SingleTreatmentPlan } from "@/types/Events";

interface BasicInformation {
  id: string;
  participant_first_name: string;
  participant_last_name: string;
  participant_father_name: string;
  participant_mother_name: string;
  father_mobile_number: string;
  mother_mobile_number: string;
  address_street_information: string;
  country: string;
  state: string;
  city: string;
  apartment_number: string;
  zip_code: string;
  implementation_start_date: string;
  implementation_stop_date: string;
  participant_background_information: string;
  behavior_intervention_protocol: string;
  transport_requirements_and_recommendations: string;
  statement_of_family_strength_and_resources: string;
  phone: null;
  intake_full_id: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

interface ObjectiveTermStep {
  task_analysis: string;
  baseline: string;
}

interface Goal {
  id: string;
  goal_area: string;
  target_skill: string;
  short_term_objective: string;
  objective_term_steps: ObjectiveTermStep[];
  goal_status: string;
  goal_setting: string;
  number_of_trials: number;
  goal_frequency: string;
  current_skill_level: string;
  target_performance_level: string;
  goal_background: string;
  goal_statement: string;
  implementation_procedure: string;
  evaluating_progress: string[];
  reinforcers: string[];
  materials: string[];
  progress_monitoring: string;
  mastery_towards_goal_achievement: string;
  expected_outcome: string;
  goal_comment: string | null;
  treatment_plan_id: string | null;
  intake_full_id: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface TreatmentGoalSignature {
  signature_url?: string;
  intake_full_id: string;
  treatment_full_id?: string;
  // signed_by: "9c9bec50-3e5b-482f-a8ef-f15cf1416690";
  created_at?: string;
  full_name?: string;
}

export interface TreatmentPlanData {
  participant_name: string;
  treatment_plan: string;
  basicInformation: BasicInformation;
  status?: string;
  goals: Goal[];
  schedule?: {
    day_of_week: string;
    start_time: string;
    end_time: string;
  }[];
  treatmentGoalSignature: TreatmentGoalSignature | null;
}

const BasicInformationSchema = z.object({
  id: z.string(),
  participant_first_name: z.string(),
  participant_last_name: z.string(),
  participant_father_name: z.string(),
  participant_mother_name: z.string(),
  father_mobile_number: z.string(),
  mother_mobile_number: z.string(),
  address_street_information: z.string(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  apartment_number: z.string(),
  zip_code: z.string(),
  implementation_start_date: z.string(),
  implementation_stop_date: z.date(),
  participant_background_information: z.string(),
  behavior_intervention_protocol: z.string(),
  transport_requirements_and_recommendations: z.string(),
  phone: z.null(),
  intake_full_id: z.string(),
  registered_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.null(),
});

// ObjectiveTermStep Schema
const ObjectiveTermStepSchema = z.object({
  task_analysis: z.string(),
  baseline: z.string(),
});

// Goal Schema
const GoalSchema = z.object({
  id: z.string(),
  goal_area: z.string(),
  target_skill: z.string(),
  short_term_objective: z.string(),
  objective_term_steps: z.array(ObjectiveTermStepSchema),
  goal_status: z.string(),
  goal_setting: z.string(),
  number_of_trials: z.number(),
  goal_frequency: z.string(),
  current_skill_level: z.string(),
  target_performance_level: z.string(),
  goal_background: z.string(),
  goal_statement: z.string(),
  implementation_procedure: z.string(),
  treatment_plan_id: z.string().nullable(),
  intake_full_id: z.string(),
  registered_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});

// TreatmentPlanData Schema
const TreatmentPlanDataSchema = z.object({
  participant_name: z.string(),
  treatment_plan: z.string(),
  basicInformation: BasicInformationSchema,
  goals: z.array(GoalSchema),
});

// Example of validating data using the schemas
const validateTreatmentPlanData = (data: unknown) => {
  try {
    const b = TreatmentPlanDataSchema.parse(data);
  } catch (error: any) {
    console.error("Validation failed:", error.errors);
  }
};
Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto/Roboto-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Roboto/Roboto-Bold.ttf", fontWeight: "bold" },
  ],
});
const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  sectionB: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "bold",
    fontFamily: "Roboto",
    borderBottom: "1.2px solid black",
  },

  bigTitle: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  imageSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  text: { fontSize: 11, marginBottom: 2 },
  softText: { fontSize: 11, fontWeight: 100, maxWidth: "70%" },
  softTextW: { fontSize: 11, fontWeight: 100, maxWidth: "100%" },

  goalSoftText: {
    fontSize: 11,
    fontWeight: 100,
    marginBottom: 2,
    marginTop: 2,
  },
  boldText: { fontSize: 11, fontWeight: "bold", fontFamily: "Roboto" },

  logoImage: {
    height: 40,
    width: 120,
  },
  column: {
    display: "flex",
    flexDirection: "column",
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },

  borderedFlexLine: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1px solid black",
    justifyContent: "space-between",
  },
  textFlex: {
    display: "flex",
    flexDirection: "row",
    width: "43%",
    justifyContent: "space-between",
  },

  goalTextFlex: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1px solid black",
  },

  goalBold: {
    width: "30%",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Roboto",
  },

  objectiveBold: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Roboto",
    marginRight: 8,
  },

  objectiveSoft: {
    fontSize: 10,
    fontFamily: "Roboto",
    marginLeft: 2,
  },

  signatureTitle: {
    fontSize: 15,
    marginBottom: 4,
    fontWeight: "bold",
    fontFamily: "Roboto",
    textDecoration: "underline",
    marginTop: 9,
  },
  signatureBody: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    marginVertical: 5,
  },

  signatureBodySpecial: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    marginVertical: 30,
  },

  signatureBodyLeft: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Roboto",
    width: "47%",
  },

  signatureBodyRight: {
    fontSize: 11,
    fontFamily: "Roboto",
    width: "47%",
    paddingVertical: 3,
    borderBottom: "1px solid black",
  },
});

const SignatureSplit = ({
  header,
  subText,
}: {
  header: string;
  subText: string | any;
}) => {
  return (
    <View style={{ ...styles.signatureBody }}>
      <Text style={styles.signatureBodyLeft}>{header}</Text>
      <Text style={styles.signatureBodyRight}>{subText}</Text>
    </View>
  );
};

const SubTextHeading = ({
  header,
  subText,
}: {
  header: string;
  subText: string;
}) => {
  return (
    <View style={styles.textFlex}>
      <Text style={styles.boldText}>{header} : </Text>
      <Text style={styles.softText}>{subText}</Text>
    </View>
  );
};

const GoalText = ({
  header,
  subText,
}: {
  header: string;
  subText: string | any;
}) => {
  return (
    <View style={styles.goalTextFlex}>
      <Text style={styles.goalBold}>{header} : </Text>
      <Text style={styles.softText}>{subText}</Text>
    </View>
  );
};
export const TreatmentPlanPDF: React.FC<{
  data: TreatmentPlanData;
  parentName?: string;
  parentSignatureUrl?: string | null;
  parentSignatureDate?: string | null;
}> = ({ data, parentName, parentSignatureUrl, parentSignatureDate }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.imageSection}>
          <Image src="/assets/images/LOGO.png" style={styles.logoImage} />

          <View style={styles.column}>
            <Text style={styles.bigTitle}>
              Participant Name: {data?.basicInformation?.participant_first_name}{" "}
              {data?.basicInformation?.participant_last_name}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Basic Information</Text>
        <View style={styles.sectionB}>
          <View style={styles.borderedFlexLine}>
            <SubTextHeading
              header="First Name"
              subText={data?.basicInformation?.participant_first_name}
            />
            <SubTextHeading
              header="Last Name"
              subText={data?.basicInformation?.participant_last_name}
            />
          </View>

          <View style={styles.borderedFlexLine}>
            <SubTextHeading
              header="Father Name"
              subText={data?.basicInformation?.participant_father_name}
            />
            <SubTextHeading
              header="Mother Name"
              subText={data?.basicInformation?.participant_mother_name}
            />
          </View>

          <View style={styles.borderedFlexLine}>
            <SubTextHeading
              header="Father Mobile Number"
              subText={data?.basicInformation?.father_mobile_number}
            />
            <SubTextHeading
              header="Mother Mobile Number"
              subText={data?.basicInformation?.mother_mobile_number}
            />
          </View>

          <View style={styles.borderedFlexLine}>
            <SubTextHeading
              header="Address"
              subText={data?.basicInformation?.address_street_information}
            />
            <SubTextHeading
              header="City"
              subText={data?.basicInformation?.city}
            />
          </View>

          <View style={styles.borderedFlexLine}>
            <SubTextHeading
              header="State"
              subText={data?.basicInformation?.state}
            />
            <SubTextHeading
              header="Country"
              subText={data?.basicInformation?.country}
            />
          </View>

          <View style={styles.borderedFlexLine}>
            <SubTextHeading
              header="Implementation Start Date"
              subText={data?.basicInformation?.implementation_start_date}
            />
            <SubTextHeading
              header="Implementation Stop Date"
              subText={data?.basicInformation?.implementation_stop_date}
            />
          </View>
        </View>

        <View style={styles.sectionB}>
          <Text style={styles.title}>Participant Background Information</Text>

          <Text style={styles.softTextW}>
            {data?.basicInformation?.participant_background_information}
          </Text>
        </View>

        <View style={styles.sectionB}>
          <Text style={styles.title}>
            Behavior Intervention Protocol And Recommendation
          </Text>

          <Text style={styles.softTextW}>
            {data?.basicInformation?.behavior_intervention_protocol}
          </Text>
        </View>

        <View style={styles.sectionB}>
          <Text style={styles.title}>
            Transportation Requirements & Recommendation
          </Text>

          <Text style={styles.softTextW}>
            {data?.basicInformation?.transport_requirements_and_recommendations}
          </Text>
        </View>

        {data?.basicInformation?.statement_of_family_strength_and_resources &&
          typeof data?.basicInformation
            ?.statement_of_family_strength_and_resources === "string" &&
          data?.basicInformation?.statement_of_family_strength_and_resources
            ?.length > 0 && (
            <View style={styles.sectionB}>
              <Text style={styles.title}>
                Statement of family's strengths & resources
              </Text>

              <Text style={styles.softTextW}>
                {
                  data?.basicInformation
                    ?.statement_of_family_strength_and_resources
                }
              </Text>
            </View>
          )}

        {data?.goals &&
          Array.isArray(data?.goals) &&
          data?.goals?.length > 0 &&
          data?.goals.map((goal, index) => (
            <View style={styles.section} key={index}>
              <Text style={styles.title}>Goal {index + 1}</Text>
              <GoalText header="Goal Area" subText={goal?.goal_area} />
              <GoalText header="Target Skill" subText={goal?.target_skill} />
              <GoalText
                header="Short Term Objective"
                subText={goal?.short_term_objective}
              />
              <GoalText header="Goal Status" subText={goal?.goal_status} />
              <GoalText header="Goal Setting" subText={goal?.goal_setting} />
              <GoalText
                header="Number of Trials"
                subText={
                  goal?.number_of_trials
                    ? goal?.number_of_trials?.toString()
                    : "-"
                }
              />
              <GoalText
                header="Goal Frequency"
                subText={goal?.goal_frequency}
              />
              <GoalText
                header="Current Skill Level"
                subText={goal?.current_skill_level}
              />
              <GoalText
                header="Target Performance Level"
                subText={goal?.target_performance_level}
              />
              <GoalText
                header="Goal Background"
                subText={goal?.goal_background}
              />
              <GoalText
                header="Goal Statement"
                subText={goal?.goal_statement}
              />
              <GoalText
                header="Implementation Procedure"
                subText={goal?.implementation_procedure}
              />
              {goal?.evaluating_progress?.length && (
                <GoalText
                  header="Evaluating Progress"
                  subText={
                    goal?.evaluating_progress?.length
                      ? goal?.evaluating_progress.join(", ")
                      : "N/A"
                  }
                />
              )}{" "}
              {goal?.progress_monitoring && (
                <GoalText
                  header="Progress Monitoring"
                  subText={goal?.progress_monitoring}
                />
              )}
              {goal?.mastery_towards_goal_achievement && (
                <GoalText
                  header="Mastery towards goal achievement"
                  subText={goal?.mastery_towards_goal_achievement}
                />
              )}{" "}
              {goal?.reinforcers?.length && (
                <GoalText
                  header="Reinforcers"
                  subText={
                    goal?.reinforcers?.length
                      ? goal?.reinforcers.join(", ")
                      : "N/A"
                  }
                />
              )}
              {goal?.materials?.length && (
                <GoalText
                  header="Materials"
                  subText={
                    goal?.materials?.length ? goal?.materials.join(", ") : "N/A"
                  }
                />
              )}{" "}
              {goal?.expected_outcome && (
                <GoalText
                  header="Expected Outcome"
                  subText={goal?.expected_outcome}
                />
              )}
              {goal?.goal_comment && (
                <GoalText
                  header="Goal Comment (Optional)"
                  subText={goal?.goal_comment}
                />
              )}
              <View>
                <View style={styles.goalTextFlex}>
                  <Text style={styles.goalBold}>Task Analysis : </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {goal?.objective_term_steps &&
                      Array.isArray(goal?.objective_term_steps) &&
                      goal?.objective_term_steps?.length > 0 &&
                      goal?.objective_term_steps.map((step, stepIndex) => (
                        <View
                          key={stepIndex}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            flexWrap: "wrap",
                            maxWidth: "70%",
                            paddingTop: 2,
                            marginVertical: 3,
                            paddingBottom: 2,
                          }}
                        >
                          <Text style={styles.objectiveBold}>
                            Step {stepIndex + 1}
                          </Text>
                          <Text style={styles.objectiveSoft}>
                            - {step?.task_analysis}
                          </Text>
                          <Text style={styles.objectiveSoft}>
                            - {step?.baseline}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              </View>
            </View>
          ))}

        <View>
          <Text style={styles.title}>Schedule</Text>

          {data?.schedule &&
            data.schedule?.map((data, i) => (
              <View
                key={i}
                style={{
                  paddingTop: 2,
                  paddingHorizontal: 2,
                }}
              >
                <GoalText
                  header={data.day_of_week}
                  subText={`${data?.start_time} - ${data?.end_time}`}
                />
              </View>
            ))}
        </View>

        {data?.treatmentGoalSignature && (
          <View
            style={{
              marginTop: 30,
            }}
          >
            <Text style={styles.signatureTitle}>Signature</Text>

            <SignatureSplit
              header="Parent/Guardian name :"
              subText={parentName ?? ""}
            />

            <SignatureSplit
              header="Signature:"
              subText={
                // eslint-disable-next-line jsx-a11y/alt-text
                parentSignatureUrl && typeof parentSignatureUrl === "string" ? (
                  <Image
                    src={parentSignatureUrl ?? ""}
                    style={{
                      height: 40,
                      width: 120,
                    }}
                  />
                ) : (
                  ""
                )
              }
            />

            {/* <SignatureSplit header="Date:" subText="" marginVertical={30} /> */}

            <View style={{ ...styles.signatureBody, marginBottom: 40 }}>
              <Text style={styles.signatureBodyLeft}>Date:</Text>
              <Text style={styles.signatureBodyRight}>
                {parentSignatureDate && typeof parentSignatureDate === "string"
                  ? formatDate(new Date(parentSignatureDate ?? ""))
                  : ""}
              </Text>
            </View>

            <SignatureSplit
              header="Name of the person who prepared Treatment Plan(TP):"
              subText={data?.treatmentGoalSignature?.full_name}
            />

            <SignatureSplit
              header="Signature: "
              subText={
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image
                  src={data?.treatmentGoalSignature?.signature_url ?? ""}
                  style={{
                    height: 40,
                    width: 120,
                  }}
                />
              }
            />

            <SignatureSplit
              header="Date"
              subText={
                data &&
                data?.treatmentGoalSignature &&
                data?.treatmentGoalSignature?.created_at &&
                formatDate(
                  new Date(data?.treatmentGoalSignature?.created_at ?? "") ?? ""
                )
              }
            />
          </View>
        )}
      </Page>
    </Document>
  );
};

export const convertPdfToUint8Array = async (
  documentComponent: JSX.Element
): Promise<Uint8Array> => {
  // Render the PDF document to a Blob
  const blob: Blob = await pdf(documentComponent).toBlob();

  // Convert the Blob to an ArrayBuffer
  const arrayBuffer: ArrayBuffer = await blob.arrayBuffer();

  // Convert the ArrayBuffer to a Uint8Array
  const uint8Array: Uint8Array = new Uint8Array(arrayBuffer);

  return uint8Array;
};

const TreatmentPlanPDFDOwnload: React.FC<{
  clientId: string;
  href: string;
  treatmentPlan: SingleTreatmentPlan;
}> = ({ clientId, href, treatmentPlan }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const isCompleted =
    treatmentPlan?.status === "not_sent" ||
    treatmentPlan?.status === "awaiting_signature" ||
    treatmentPlan?.status === "signed" ||
    treatmentPlan?.status === "completed";

  const fileName = treatmentPlan?.basicInformation
    ? `Treatment_plan_${treatmentPlan?.basicInformation?.participant_first_name}_${treatmentPlan?.basicInformation?.participant_last_name}.pdf`
    : "unamed_patient";

  const handleDownload = async () => {
    setIsGeneratingPdf(true);
    const docDefinition: any = await createTreatmentPlanPDF(
      treatmentPlan,
      treatmentPlan?.parent_name ?? "",
      treatmentPlan?.treatmentGoalSignature?.parent_signature_url ?? "",
      treatmentPlan?.treatmentGoalSignature?.date_parent_signed ?? ""
    );
    pdfMake.createPdf(docDefinition).download(fileName);
    setIsGeneratingPdf(false);
  };

  if (isCompleted) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}
        disabled={isGeneratingPdf}
        className="w-fit ml-auto flex items-center justify-center rounded-[6px] hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]"
      >
        {isGeneratingPdf ? (
          <Loader height="h-fit" />
        ) : (
          <TreatmentPlanDownloadIcon />
        )}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="w-fit ml-auto flex items-center justify-center rounded-[6px] hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]"
    >
      <EyeIcon />
    </Link>
  );
};

export default TreatmentPlanPDFDOwnload;
