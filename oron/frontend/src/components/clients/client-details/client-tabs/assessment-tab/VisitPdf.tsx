/* eslint-disable jsx-a11y/alt-text */
"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import {
  FullTreatmentPlanGoals,
  FullVisitForm,
  VisitBehaviorManagement,
  VisitCommunication,
  VisitPlayLeisure,
  VisitSafetyAndSurvivalSkills,
  VisitSelfManagement,
  VisitSnackMealTime,
  VisitSocialization,
} from "@/types/Visit";
import { formatDate, generateVisitGoalSummaryText } from "@/utils/helpers";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto/Roboto-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Roboto/Roboto-Bold.ttf", fontWeight: "bold" },
  ],
});

const VisitPdf = ({
  data,
  username,
  treatmentPlanGoals,
}: {
  data: FullVisitForm;
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

  const constructSelfManagementContent = (
    selfManagementData?: VisitSelfManagement,
    username?: string
  ) => {
    const skills: string[] = [];

    if (selfManagementData?.responding_to_others) {
      skills.push(`responding to others during`);
    }
    if (selfManagementData?.sharing) {
      skills.push(`sharing during`);
    }
    if (selfManagementData?.increasing_on_task_behavior) {
      skills.push(`increasing on-task behavior during`);
    }
    if (selfManagementData?.initiating_interactions) {
      skills.push(`initiating interactions during`);
    }
    if (selfManagementData?.conversing_with_others) {
      skills.push(`conversing with others during`);
    }
    if (selfManagementData?.increasing_play_skills) {
      skills.push("increasing play skills");
    }
    if (selfManagementData?.promoting_daily_living_skills) {
      skills.push(`promoting daily living skills during`);
    }
    if (selfManagementData?.taking_turns) {
      skills.push(`taking turns during`);
    }
    if (selfManagementData?.following_the_rules) {
      skills.push(`following the rules during`);
    }
    if (selfManagementData?.reducing_occurence_of_interfering_behavior) {
      skills.push("reducing occurrence of interfering behavior");
    }
    if (selfManagementData?.cooperate_with_peers_in_group_activity) {
      skills.push(`cooperating with peers in group activity during`);
    }
    if (selfManagementData?.other) {
      skills.push(selfManagementData?.other);
    }

    const skillsString = skills.join("; ");

    return `I observed ${username} perform the following self-management skill(s) without any help from me: ${skillsString}`;
  };

  const constructBehaviorManagementContent = (
    behaviorManagementData?: VisitBehaviorManagement[],
    username?: string
  ) => {
    if (!behaviorManagementData?.length) {
      return `${username} didn't exhibit any Behavior during this session.`;
    }

    const behaviorDetails = behaviorManagementData.map((behavior) => {
      return `Behavior: ${behavior?.behavior_type ?? "N/A"}, Description: ${
        behavior?.behavior_description ?? "N/A"
      }, Time: ${behavior?.what_time_did_behavior_occur ?? "N/A"}, Severity: ${
        behavior?.severity ?? "N/A"
      }, Occurrences: ${
        behavior?.how_many_times_did_behavior_occur ?? 0
      }, Duration: ${
        behavior?.for_how_long_did_behavior_occur ?? 0
      } minutes, Antecedent: ${behavior?.antecedent ?? "N/A"}, Consequence: ${
        behavior?.consequence ?? "N/A"
      }, Setting: ${behavior?.setting ?? "N/A"}, Crisis Intervention: ${
        behavior?.other_crisis_intervention ?? "N/A"
      }`;
    });

    return behaviorDetails.join("\n\n");
  };

  const constructCommunicationContent = (
    communicationData?: VisitCommunication,
    username?: string
  ) => {
    if (!communicationData) {
      return `The primary ways ${username} communicated with me today were not observed.`;
    }

    const communicationMethods: string[] = [];

    if (communicationData?.gestures) {
      communicationMethods.push(`gestures`);
    }
    if (communicationData?.written_words) {
      communicationMethods.push(`written words`);
    }
    if (communicationData?.picture_communication_symbols) {
      communicationMethods.push(`picture communication symbols`);
    }
    if (communicationData?.objects) {
      communicationMethods.push(`objects`);
    }
    if (communicationData?.short_phrases) {
      communicationMethods.push(`short phrases`);
    }
    if (communicationData?.repetitive_phrases) {
      communicationMethods.push(`repetitive phrases`);
    }
    if (communicationData?.icons_pictures) {
      communicationMethods.push(`icons or pictures`);
    }
    if (communicationData?.verbal_sounds) {
      communicationMethods.push(`verbal sounds`);
    }
    if (communicationData?.type_words) {
      communicationMethods.push(`typed words`);
    }
    if (communicationData?.single_words) {
      communicationMethods.push("single words");
    }
    if (communicationData?.photographs) {
      communicationMethods.push(`photographs`);
    }
    if (communicationData?.sign_language) {
      communicationMethods.push(`sign language`);
    }
    if (communicationData?.an_augmentative_communication_device) {
      communicationMethods.push(`augmentative communication device`);
    }
    if (communicationData?.picture_exchange_communication_system) {
      communicationMethods.push(`picture exchange communication system`);
    }
    if (communicationData?.other) {
      communicationMethods.push(
        `${communicationData.other_description ?? "Other"}`
      );
    }

    const communicationMethodsString = communicationMethods.join("; ");

    return `The primary ways ${username} communicated with me today were ${communicationMethodsString}. When ${username} communicated, I interpreted that they: showed appreciation.`;
  };

  const constructSnackMealTimeContent = (
    snackMealTimeData?: VisitSnackMealTime,
    username?: string
  ) => {
    if (!snackMealTimeData) {
      return `${username} did not have any snack or meal details recorded during this session.`;
    }

    // Initialize strings for meal, drink, and actions
    const mealStatus = snackMealTimeData?.ate_all_meal_or_snack
      ? `${username} ate all the meal/snack`
      : snackMealTimeData?.ate_some_meal_or_snack
      ? `${username} ate some of the meal/snack`
      : snackMealTimeData?.refused_all_meal_or_snack
      ? `${username} refused all meal/snack`
      : `${username}'s meal status is not recorded`;

    const waterStatus = snackMealTimeData?.drank_a_lot_of_water
      ? "drank a lot of water"
      : snackMealTimeData?.drank_some_water
      ? "drank some water"
      : snackMealTimeData?.refused_all_water
      ? "refused all water"
      : "water intake is not recorded";

    const juiceStatus = snackMealTimeData?.drank_a_lot_of_juice
      ? "drank a lot of juice"
      : snackMealTimeData?.drank_some_juice
      ? "drank some juice"
      : snackMealTimeData?.refused_all_juice
      ? "refused all juice"
      : "juice intake is not recorded";

    const mealProvided = snackMealTimeData?.specify_what_snack_or_meal_provided
      ? `He ate: ${snackMealTimeData.specify_what_snack_or_meal_provided}`
      : "No specific meal or snack was recorded";

    const assistance = snackMealTimeData?.clean_up_after_snack_or_meal
      ? `I provided the following support to ${username} during snack/meal time: Clean-up after snack/meal`
      : "No support was needed during snack/meal time";

    const clientHelp =
      snackMealTimeData?.client_helped_to_clean_up_and_put_away_dishes
        ? `${username} helped in cleaning up and putting away dishes after the meal/snack.`
        : `${username} did not help in cleaning up after the meal/snack.`;

    // Construct final content
    return `${mealStatus}, ${waterStatus}, ${juiceStatus}. ${mealProvided}. ${assistance} ${clientHelp}`;
  };

  const constructPlayLeisureContent = (
    playLeisureData?: VisitPlayLeisure,
    username?: string
  ) => {
    if (!playLeisureData) {
      return `${username} did not engage in any play or leisure activities during this session.`;
    }

    // Initialize an array to store the activities
    const activities: string[] = [];

    // Check for each activity and add it to the array if it was performed
    if (playLeisureData?.puzzle) activities.push("puzzle");
    if (playLeisureData?.dance) activities.push("dance");
    if (playLeisureData?.arts_and_crafts) activities.push("arts and crafts");
    if (playLeisureData?.listen_to_music) activities.push("listening to music");
    if (playLeisureData?.icons_or_pictures)
      activities.push("icons or pictures");
    if (playLeisureData?.computer_games) activities.push("computer games");
    if (playLeisureData?.short_naps) activities.push("short naps");
    if (playLeisureData?.other && playLeisureData?.other_specify) {
      activities.push(playLeisureData.other_specify);
    }

    // If no activities were performed, return a default message
    if (activities.length === 0) {
      return `${username} did not engage in any play or leisure activities during this session.`;
    }

    // Join the activities with commas and return the formatted text
    const activitiesString = activities.join(", ");
    return `For short breaks, ${username} was engaged in: ${activitiesString}.`;
  };

  const constructSocializationContent = (
    socializationData?: VisitSocialization,
    username?: string
  ) => {
    if (!socializationData) {
      return `I did not support ${username} in any socialization, recreation, or community integration activities during this session.`;
    }

    // Initialize an array to collect the activities
    const activities: string[] = [];

    // Check each socialization, recreation, and community integration activity
    if (socializationData?.birthday_party) activities.push("birthday party");
    if (socializationData?.communication_session)
      activities.push("communication session");
    if (socializationData?.social_group) activities.push("social group");
    if (socializationData?.music_dance_group)
      activities.push("music/dance group");
    if (
      socializationData?.other_social_setting &&
      socializationData?.specify_other_social_setting
    ) {
      activities.push(socializationData?.specify_other_social_setting);
    }
    if (socializationData?.play_at_the_park)
      activities.push("play at the park");
    if (socializationData?.basketball) activities.push("basketball");
    if (socializationData?.watch_movie) activities.push("watch movie");
    if (socializationData?.bowling) activities.push("bowling");
    if (socializationData?.swimming) activities.push("swimming");
    if (
      socializationData?.other_recreation &&
      socializationData?.specify_other_recreation
    ) {
      activities.push(socializationData?.specify_other_recreation);
    }
    if (socializationData?.visit_to_the_library)
      activities.push("visit to the library");
    if (socializationData?.visit_to_the_museum)
      activities.push("visit to the museum");
    if (socializationData?.visit_to_the_zoo)
      activities.push("visit to the zoo");
    if (socializationData?.visit_to_the_shopping_mall)
      activities.push("visit to the shopping mall");
    if (socializationData?.visit_to_the_post_office)
      activities.push("visit to the post office");
    if (
      socializationData?.other_community_integration &&
      socializationData?.specify_other_community_integration
    ) {
      activities.push(socializationData?.specify_other_community_integration);
    }

    // If no activities were found, return a default message
    if (activities.length === 0) {
      return `I did not support ${username} in any socialization, recreation, or community integration activities during this session.`;
    }

    // Join activities with commas and return a formatted string
    const activitiesString = activities.join(", ");
    return `I supported ${username} participate in community integration activity during our: ${activitiesString}.`;
  };

  const constructSafetyAndSurvivalSkillsContent = (
    safetyAndSurvivalSkillsData?: VisitSafetyAndSurvivalSkills,
    username?: string
  ) => {
    if (!safetyAndSurvivalSkillsData) {
      return `I did not support ${username} in practicing any safety or survival skills today.`;
    }

    // Initialize an array to collect the practiced skills
    const skills: string[] = [];

    // Check each safety/survival skill
    if (safetyAndSurvivalSkillsData?.cross_the_street)
      skills.push("cross the street");
    if (safetyAndSurvivalSkillsData?.awareness_of_strangers)
      skills.push("awareness of strangers");
    if (safetyAndSurvivalSkillsData?.fire_emergency_awareness)
      skills.push("fire emergency awareness");
    if (safetyAndSurvivalSkillsData?.unlock_door_when_trapped_in_a_room) {
      skills.push("unlock the door when trapped in a room");
    }
    if (
      safetyAndSurvivalSkillsData?.other &&
      safetyAndSurvivalSkillsData?.specify_other
    ) {
      skills.push(safetyAndSurvivalSkillsData.specify_other);
    }

    // If no skills were found, return a default message
    if (skills.length === 0) {
      return `I did not support ${username} in practicing any safety or survival skills today.`;
    }

    // Join skills with commas and return a formatted string
    const skillsString = skills.join(", ");
    return `I supported ${username} to practice the following safety skill(s) today: ${skillsString}.`;
  };

  const TextRow = ({ header, value }: { header: string; value: string }) => (
    <View style={styles.textRow}>
      <Text style={styles.boldText}>{header}:</Text>
      <Text style={styles.normalText}>{value}</Text>
    </View>
  );

  const TextBlock = ({
    content,
    header,
  }: {
    content: string;
    header: string;
  }) => (
    <View style={styles.textColumn}>
      <Text style={styles.blockBoldText}>{header}</Text>
      <Text style={styles.normalBlockText}>{content}</Text>
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
              header="Location of Service"
              value={visitData?.sessionHighlights?.location || "N/A"}
            />
            <TextRow
              header="Level of Compliance"
              value={visitData?.sessionHighlights?.level_of_compliance || "N/A"}
            />
            <TextRow
              header="Hospitalization"
              value={
                visitData?.sessionHighlights?.client_hospitalized_in_care_today
                  ? `${username} was NOT hospitalized while in my care today`
                  : "No hospitalization"
              }
            />
            <TextRow
              header="Safety"
              value={
                visitData?.sessionHighlights
                  ?.client_placed_themselves_in_harm_by_leaving_my_care
                  ? `${username} did NOT place himself in a potentially dangerous situation while in my care`
                  : "No dangerous situations"
              }
            />
            <TextRow
              header="Injurious To Self"
              value={
                visitData?.sessionHighlights?.injury_to_self ||
                "No events of injury to self"
              }
            />
            <TextRow
              header="Aggression to Others"
              value={
                visitData?.sessionHighlights?.aggression_to_others ||
                "No events of aggression to others"
              }
            />
          </View>

          <Text style={styles.titleText}>
            Transportation Type & Objectives:
          </Text>

          <View style={styles.section}>
            <TextBlock
              header="Concerns and Challenges:"
              content={
                visitData?.concernAndChallenges
                  ?.was_there_any_concerns_or_challenges
                  ? "there was  concern(s)/challenge(s) during this session"
                  : "no concern(s)/challenge(s) during this session"
              }
            />

            <TextBlock
              header="Self-Management:"
              content={constructSelfManagementContent(
                visitData?.selfManagement,
                username
              )}
            />

            <TextBlock
              header="Behavior Management:"
              content={constructBehaviorManagementContent(
                visitData?.behaviorManagement,
                username
              )}
            />

            <TextBlock
              header="Communication/Self Direction:"
              content={constructCommunicationContent(
                visitData?.communication,
                username
              )}
            />

            <TextBlock
              header="During snack/meal time:"
              content={constructSnackMealTimeContent(
                visitData?.snackMealTime,
                username
              )}
            />

            <TextBlock
              header="Play/Leisure:"
              content={constructPlayLeisureContent(
                visitData?.playLeisure,
                username
              )}
            />

            <TextBlock
              header="Socialization/Recreation/Community Integration:"
              content={constructSocializationContent(
                visitData?.socialization,
                username
              )}
            />

            <TextBlock
              header="Safety/Survival Skills:"
              content={constructSafetyAndSurvivalSkillsContent(
                visitData?.safetyAndSurvivalSkills,
                username
              )}
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
                  This goal was practiced in{" "}
                </Text>
                <Text style={styles.boldText}>
                  {visitData?.visitGoals[index]
                    ?.where_was_the_activity_practiced
                    ? `The goal was practiced ${visitData?.visitGoals[index]?.where_was_the_activity_practiced}`
                    : "N/A"}
                </Text>
              </View>

              <View style={styles.textRow}>
                <Text style={styles.normalBlockText}>
                  The activity occurred:{" "}
                </Text>
                <Text style={styles.boldText}>
                  {visitData?.visitGoals[index]
                    ?.where_was_the_activity_practiced ?? "N/A"}
                </Text>
              </View>

              {visitData?.visitGoals[index]?.goal_steps.map(
                (step, stepIndex) => (
                  <Text style={styles.boldText} key={stepIndex + 1}>
                    {generateVisitGoalSummaryText(
                      username,
                      typeof step?.task_analysis === "string"
                        ? step.task_analysis
                        : "N/A",
                      typeof step?.prompt_used === "string"
                        ? step.prompt_used
                        : "N/A",
                      typeof step?.success === "string" ? step.success : "N/A",
                      typeof step?.opportunities === "string"
                        ? step.opportunities
                        : "N/A"
                    )}
                  </Text>
                )
              )}

              <View style={styles.textRow}>
                <Text style={styles.normalText}>{username} responded by: </Text>
                <Text style={styles.boldText}>
                  {visitData?.visitGoals[index]
                    ?.client_response_or_reaction_was ?? "N/A"}
                </Text>
              </View>

              <View style={styles.textRow}>
                <Text style={styles.normalText}>
                  Consequently, {username}:{" "}
                </Text>
                <Text style={styles.boldText}>
                  {visitData?.visitGoals[index]?.consequently_client_did ??
                    "N/A"}
                </Text>
              </View>

              <View style={styles.textRow}>
                <Text style={styles.normalText}>{username} was rewarded: </Text>
                <Text style={styles.boldText}>
                  {visitData?.visitGoals[index]?.client_reward ?? "N/A"}
                </Text>
              </View>

              <View style={styles.textRow}>
                <Text style={styles.normalText}>
                  {username} spent approximately:{" "}
                </Text>
                <Text style={styles.boldText}>
                  {visitData?.visitGoals[index]?.total_time_spent_on_activity ??
                    "N/A"}{" "}
                  mins participating on this activity
                </Text>
              </View>
            </View>
          ))}
        </Page>
      </Document>
    );
  }

  return <Document></Document>;
};

export default VisitPdf;
