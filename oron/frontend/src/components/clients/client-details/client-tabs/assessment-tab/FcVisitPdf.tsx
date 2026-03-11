/* eslint-disable jsx-a11y/alt-text */
"use client";

import { FullFcVisitForm, FullTreatmentPlanGoals } from "@/types/Visit";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatDate } from "@/utils/helpers";

const FcVisitPdf = ({
  data,
  username,
  treatmentPlanGoals,
}: {
  data: FullFcVisitForm;
  username: string;
  treatmentPlanGoals: FullTreatmentPlanGoals;
}) => {
  const visitData = data?.data;
  const clientTreatmentPlanGoals = treatmentPlanGoals?.data;

  const styles = StyleSheet.create({
    page: {
      padding: 40,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    logo: {
      width: 100,
      height: 40,
    },
    titleText: {
      fontSize: 15,
      fontFamily: "Roboto",
      fontWeight: "bold",
      marginBottom: 10,
      textDecoration: "underline",
    },
    singleSection: {
      marginBottom: 15,
      paddingBottom: 20,
      flexDirection: "column",
      gap: 5,
    },
    section: {
      marginBottom: 15,
      paddingBottom: 20,
      flexDirection: "column",
      gap: 10,
    },
    textRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 2,
    },
    textColumn: {
      flexDirection: "column",
      gap: "5px",
    },
    boldText: {
      fontFamily: "Roboto",
      fontSize: 12,
      fontWeight: "bold",
    },
    blockBoldText: {
      fontFamily: "Roboto",
      fontSize: 12,
      fontWeight: "bold",
      textDecoration: "underline",
    },
    normalText: {
      fontFamily: "Roboto",
      fontSize: 12,
      marginLeft: 5,
    },
    normalBlockText: {
      fontFamily: "Roboto",
      fontSize: 12,
    },
    divider: {
      marginTop: 10,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#000",
    },
    goalContainer: {
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      backgroundColor: "#fff",
      paddingHorizontal: 10,
    },
    goalHeader: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
    },
    goalTitle: {
      fontSize: 16,
      fontWeight: "normal",
      color: "#007bff",
      textDecorationLine: "underline",
    },
    subHeading: {
      fontWeight: "bold",
      fontSize: 13,
      marginVertical: 5,
      color: "#555",
    },
    text: {
      fontWeight: "normal",
      fontSize: 13,
      color: "#555",
    },
    stepContainer: {
      marginVertical: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: "#f9f9f9",
      borderLeftWidth: 4,
      borderLeftColor: "#000000",
      borderRadius: 5,
    },
    step: {
      marginVertical: 3,
      fontSize: 12,
      color: "#333",
    },
    headerWrapper: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
  });

  const TextRow = ({ header, value }: { header: string; value: string }) => (
    <View style={styles.textRow}>
      <Text style={styles.boldText}>{header}:</Text>
      <Text style={styles.normalText}>{value}</Text>
    </View>
  );

  if (visitData && clientTreatmentPlanGoals) {
    return (
      <Document>
        <Page style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Image src="/assets/images/LOGO.png" style={styles.logo} />
            <View>
              <Text style={styles.boldText}>Participant Name: {username}</Text>
              <Text style={styles.boldText}>
                Date Of Visit:{" "}
                {visitData?.date_of_visit
                  ? formatDate(visitData?.date_of_visit)
                  : "-"}
              </Text>
              <Text style={styles.boldText}>
                Start Time: {visitData?.start_time}
              </Text>
              <Text style={styles.boldText}>
                End Time: {visitData?.end_time}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.titleText}>Session Highlight</Text>
          {/* Session Highlights */}
          <View style={styles.singleSection}>
            <TextRow
              header="This session occured in"
              value={visitData?.sessionHighlights?.session_ocurred_in || "N/A"}
            />
            <TextRow
              header="Those present for the Family Consultation session"
              value={
                visitData?.sessionHighlights
                  ?.those_present_for_the_family_consultant_session?.length
                  ? visitData.sessionHighlights.those_present_for_the_family_consultant_session.join(
                      ", "
                    )
                  : "N/A"
              }
            />
          </View>

          <Text style={styles.titleText}>Family General Discussion</Text>
          <View style={styles.section}>
            <TextRow
              header={`Accomplishment(s) ${username} made that may or may not have been on the Family Consultation Treatment Plan`}
              value={
                visitData?.familyDiscussion
                  ?.accomplishments_client_made_void_of_family_consultation_treatment ??
                "N/A"
              }
            />
            <TextRow
              header={`Accomplishment(s) ${username}'s family made that may or may not have been on the Family Consultation Treatment Plan`}
              value={
                visitData?.familyDiscussion
                  ?.accomplishments_client_family_made_void_of_family_consultation_treatment ??
                "N/A"
              }
            />
            <TextRow
              header={`A concern or any other Topic(s) not related to the Family Consultation Treatment Plan discussed during the session`}
              value={
                visitData?.familyDiscussion
                  ?.topic_not_related_discussed_during_family_consultation ??
                "N/A"
              }
            />
          </View>

          <Text style={styles.titleText}>
            Implementation of {username}&apos;s Goal:
          </Text>

          {clientTreatmentPlanGoals.map((goal, index) => (
            <View key={goal.id} style={styles.section}>
              <View style={styles.textRow}>
                <Text style={styles.normalBlockText}>Goal {index + 1}: </Text>
                <Text style={styles.blockBoldText}>
                  {username} {goal.short_term_objective} from (
                  {goal.current_skill_level}) to {goal.target_performance_level}{" "}
                  in {goal.number_of_trials} trials for a {goal.goal_frequency}
                </Text>
              </View>

              <View style={styles.textRow}>
                <Text style={styles.normalBlockText}>Target Skill: </Text>
                <Text style={styles.blockBoldText}>{goal.target_skill}</Text>
              </View>

              <View style={styles.textRow}>
                <Text style={styles.normalBlockText}>
                  Short Term Objective:{" "}
                </Text>
                <Text style={styles.blockBoldText}>
                  {goal.short_term_objective}
                </Text>
              </View>

              <View style={styles.textRow}>
                <Text style={styles.normalBlockText}>
                  Family member(s) goal was discussed with
                </Text>
                <Text style={styles.boldText}>
                  {visitData?.visitGoals[index]
                    ?.family_members_goal_discussed_with?.length
                    ? visitData?.visitGoals[
                        index
                      ]?.family_members_goal_discussed_with.join(", ")
                    : "N/A"}
                </Text>
              </View>

              {(
                visitData?.visitGoals[index]
                  ?.current_teaching_methods_or_strategies || []
              ).map((item, index) => (
                <Text style={styles.boldText} key={index}>
                  <Text>{item.current_teaching_methods}</Text>
                  {item.discussed_at_fc_session && (
                    <Text>
                      {" "}
                      (Discussed at FC Session: {item.discussed_at_fc_session})
                    </Text>
                  )}
                </Text>
              ))}

              <View style={styles.textRow}>
                <Text style={styles.normalText}>
                  Parent/Family Member&apos;s Challenges/Difficulties when
                  Implementing Strategies
                </Text>
                <Text style={styles.boldText}>
                  {visitData?.visitGoals[index]
                    ?.parent_or_family_members_challenges_when_implementing_strategies ??
                    "N/A"}
                </Text>
              </View>

              <View style={styles.textRow}>
                <Text style={styles.normalText}>
                  Training/Instructions provided to Parents/Family Member on how
                  to implement strategies
                </Text>
                <Text style={styles.boldText}>
                  {visitData?.visitGoals[index]
                    ?.training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies ??
                    "N/A"}
                </Text>
              </View>

              <View style={styles.textRow}>
                <Text style={styles.normalText}>
                  Any additional comments (Optional)
                </Text>
                <Text style={styles.boldText}>
                  {visitData?.visitGoals[index]?.additional_comments ?? "N/A"}{" "}
                  mins participating on this activity
                </Text>
              </View>
            </View>
          ))}

          <Text style={styles.titleText}>
            Other Trainings & Consulting Services Provided
          </Text>
          <View style={styles.section}>
            <TextRow
              header={`Training & Consultation Provided on Use of Augmentative and Alternative Communication (AAC)`}
              value={
                visitData?.otherTraining
                  ?.training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication ??
                "N/A"
              }
            />
            <TextRow
              header={`Training & Consultation Provided on Communication Strategies`}
              value={
                visitData?.otherTraining
                  ?.training_and_consultation_provided_on_communication_strategies ??
                "N/A"
              }
            />
            <TextRow
              header={`Training & Consultation Provided on Behavior Intervention Strategies`}
              value={
                visitData?.otherTraining
                  ?.training_and_consultation_provided_on_behavior_intervention_strategies ??
                "N/A"
              }
            />
            <TextRow
              header={`Training & Consultation Provided on Safety at Home and in the Community`}
              value={
                visitData?.otherTraining
                  ?.training_and_consultation_provided_on_safety_at_home_and_in_the_community ??
                "N/A"
              }
            />
            <TextRow
              header={`Any Other Training and Consultation Topics`}
              value={
                visitData?.otherTraining
                  ?.any_other_training_and_consultation_topics ?? "N/A"
              }
            />
          </View>
        </Page>
      </Document>
    );
  }

  return <Document></Document>;
};

export default FcVisitPdf;
