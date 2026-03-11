"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatDate } from "@/utils/helpers";
import { FullSpecificNeedsForm } from "@/types/SpecificNeeds";

interface Props {
  data: FullSpecificNeedsForm;
}

const SpecificNeedsPdf = ({ data }: Props) => {
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
      width: 150,
      height: 50,
    },
    participantImage: {
      width: 100,
      height: 120,
    },
    participantInfo: {
      marginLeft: 20,
    },
    titleText: {
      fontSize: 16,
      fontFamily: "Helvetica-Bold",
      marginBottom: 15,
      textAlign: "center",
      textDecoration: "underline",
    },
    table: {
      marginTop: 10,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
      borderBottomStyle: "solid",
      minHeight: 40,
      flexWrap: "wrap",
      paddingVertical: 8,
      alignItems: "stretch",
    },
    tableHeader: {
      backgroundColor: "#f5f5f5",
      fontFamily: "Helvetica-Bold",
    },
    tableCol1: {
      width: "20%",
      paddingHorizontal: 5,
      paddingVertical: 3,
      fontFamily: "Helvetica-Bold",
    },
    tableCol2: {
      width: "25%",
      paddingHorizontal: 5,
      paddingVertical: 3,
    },
    tableCol3: {
      width: "25%",
      paddingHorizontal: 5,
      paddingVertical: 3,
    },
    tableCol4: {
      width: "30%",
      paddingHorizontal: 5,
      paddingVertical: 3,
    },
    text: {
      fontSize: 10,
      fontFamily: "Helvetica",
      textAlign: "left",
    },
    wrappedText: {
      fontSize: 10,
      fontFamily: "Helvetica",
      flexWrap: "wrap",
    },
    boldText: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
    },
    pageNumber: {
      position: "absolute",
      bottom: 30,
      right: 30,
      fontSize: 10,
    },
    signature: {
      marginTop: 30,
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    signatureImage: {
      width: 150,
      height: 50,
      marginTop: 20,
    },
    scheduleTitle: {
      fontSize: 14,
      fontFamily: "Helvetica-Bold",
      marginTop: 20,
      marginBottom: 10,
      textDecoration: "underline",
    },
    scheduleSubTitle: {
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      marginTop: 15,
      marginBottom: 5,
    },
    scheduleTable: {
      marginTop: 5,
      marginBottom: 10,
    },
    scheduleRow: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: "#000",
    },
    scheduleHeaderCell: {
      width: "12.5%",
      padding: 5,
      backgroundColor: "#fff",
      borderRightWidth: 1,
      borderRightColor: "#000",
    },
    scheduleCell: {
      width: "12.5%",
      padding: 5,
      borderRightWidth: 1,
      borderRightColor: "#000",
      height: 30,
    },
    dailyActivitiesTable: {
      marginTop: 5,
    },
    dailyActivitiesRow: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: "#000",
    },
    dailyActivitiesHeaderCell: {
      padding: 5,
      backgroundColor: "#fff",
      borderRightWidth: 1,
      borderRightColor: "#000",
    },
    dailyActivitiesCell: {
      padding: 5,
      borderRightWidth: 1,
      borderRightColor: "#000",
      height: 30,
    },
    startTimeCell: {
      width: "20%",
    },
    stopTimeCell: {
      width: "20%",
    },
    monToFriCell: {
      width: "20%",
    },
    saturdayCell: {
      width: "20%",
    },
    sundayCell: {
      width: "20%",
    },
  });

  const basicInfo = data?.data?.basicInformation;
  const currentNeeds = data?.data?.currentNeedOrSupport?.current_needs;
  const authorization = data?.data?.authorization;
  const serviceNeeds = data?.data?.serviceNeeds;

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDescription = (description: string | undefined) => {
    if (!description) return "";
    if (description.startsWith("[OTHER]")) {
      return description.replace("[OTHER]", "");
    }
    return description;
  };

  const formatSpecificNeeds = (needs: string[] | undefined, type: string) => {
    if (!needs || needs.length === 0) return "N/A";

    switch (type) {
      case "behaviors":
        const behaviors = needs
          .filter((n) => n.startsWith("[BEHAVIOR]"))
          .map((n) => n.replace("[BEHAVIOR]", ""));
        const strategies = needs
          .filter((n) => n.startsWith("[STRATEGY]"))
          .map((n) => n.replace("[STRATEGY]", ""));
        const triggers = needs
          .filter((n) => n.startsWith("[TRIGGER]"))
          .map((n) => n.replace("[TRIGGER]", ""));

        return `I Sometimes Display these Behaviors:${
          behaviors.join(", ") || "N/A"
        }\n\nMy Behaviors Can be Managed as Follow: ${
          strategies.join(", ") || "N/A"
        }\n\nWhat Makes Me Mad: ${triggers.join(", ") || "N/A"}`;

      case "transportation":
        return needs[0] === "Can be transported alone"
          ? "I can be Transported Alone: Yes"
          : "I can be Transported Alone: No";

      default:
        return needs.join(", ") || "N/A";
    }
  };

  const TableRow = ({
    title,
    needType,
  }: {
    title: string;
    needType: string;
  }) => {
    const need = currentNeeds?.find((n) => n.current_need_details === needType);
    const specificNeeds = formatSpecificNeeds(need?.specificNeeds, needType);

    return (
      <View style={styles.tableRow} wrap={false}>
        <View style={styles.tableCol1}>
          <Text style={styles.text}>{title}</Text>
        </View>
        <View style={styles.tableCol2}>
          <Text style={styles.wrappedText}>
            {formatDescription(need?.description)}
          </Text>
        </View>
        <View style={styles.tableCol3}>
          <Text style={styles.wrappedText}>{specificNeeds}</Text>
        </View>
        <View style={styles.tableCol4}>
          <Text style={styles.wrappedText}>
            {need?.recommendation || "N/A"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Document>
      {/* First page with current needs */}
      <Page style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/assets/images/LOGO.png" style={styles.logo} />
          <View style={{ flexDirection: "row" }}>
            {data?.data?.intakeFullForm?.profile_picture && (
              <Image
                src={data?.data?.intakeFullForm?.profile_picture}
                style={styles.participantImage}
              />
            )}

            <View style={styles.participantInfo}>
              <Text style={styles.boldText}>
                Participant Name: {basicInfo?.participant_first_name}{" "}
                {basicInfo?.participant_last_name}
              </Text>
              <Text style={styles.boldText}>
                Age: {calculateAge(basicInfo?.date_of_birth)}
              </Text>
              <Text style={styles.boldText}>Sex: {basicInfo?.gender}</Text>
              <Text style={styles.boldText}>
                Participant Home Address: {basicInfo?.home_address}
              </Text>
              <Text style={styles.boldText}>
                Parent&apos;s Phone Number: {basicInfo?.father_mobile_number},{" "}
                {basicInfo?.mother_mobile_number}
              </Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.titleText}>
          Specific Needs Sheet ({formatDate(new Date())})
        </Text>

        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.tableCol1}>
            <Text style={styles.boldText}>
              Current Health/Life Needs & Supports
            </Text>
          </View>
          <View style={styles.tableCol2}>
            <Text style={styles.boldText}>Description</Text>
          </View>
          <View style={styles.tableCol3}>
            <Text style={styles.boldText}>Specific Needs</Text>
          </View>
          <View style={styles.tableCol4}>
            <Text style={styles.boldText}>Recommendations/Instructions</Text>
          </View>
        </View>

        {/* Table Rows */}
        <TableRow title="Diagnosis" needType="diagnosis" />
        <TableRow title="Nutritional/Dietary" needType="nutritional" />
        <TableRow title="Health" needType="health" />
        <TableRow title="Allergies" needType="allergies" />
        <TableRow title="Medication" needType="medication" />
        <TableRow title="Toileting" needType="toileting" />
        <TableRow title="Communication" needType="communication" />
        <TableRow title="Behaviors" needType="behaviors" />
        <TableRow title="Rewards" needType="rewards" />
        <TableRow title="Transportation" needType="transportation" />
        <TableRow title="Staff Ratio" needType="staff_ratio" />
        <TableRow title="Supervision Type" needType="supervision" />
        <TableRow title="Recreational" needType="recreational" />
        <TableRow title="House Rules" needType="house_rules" />
        <TableRow title="Community Outing" needType="community_outing" />
        <TableRow title="Special Alerts" needType="special_alerts" />
      </Page>

      {/* Third page with schedule */}
      <Page style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/assets/images/LOGO.png" style={styles.logo} />
          <View style={{ flexDirection: "row" }}>
            {data?.data?.intakeFullForm?.profile_picture && (
              <Image
                src={data?.data?.intakeFullForm?.profile_picture}
                style={styles.participantImage}
              />
            )}
            <View style={styles.participantInfo}>
              <Text style={styles.boldText}>
                Participant Name: {basicInfo?.participant_first_name}{" "}
                {basicInfo?.participant_last_name}
              </Text>
              <Text style={styles.boldText}>
                Age: {calculateAge(basicInfo?.date_of_birth)}
              </Text>
              <Text style={styles.boldText}>Sex: {basicInfo?.gender}</Text>
              <Text style={styles.boldText}>
                Participant Home Address: {basicInfo?.home_address}
              </Text>
              <Text style={styles.boldText}>
                Parent&apos;s Phone Number: {basicInfo?.father_mobile_number},{" "}
                {basicInfo?.mother_mobile_number}
              </Text>
            </View>
          </View>
        </View>

        {/* Schedule Title */}
        <Text style={styles.scheduleTitle}>
          {basicInfo?.participant_first_name} {basicInfo?.participant_last_name}
          &apos;s Schedule
        </Text>

        <Text style={styles.scheduleSubTitle}>My Service Needs</Text>

        {/* Schedule Table */}
        <View style={styles.scheduleTable}>
          {/* Header Row */}
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleHeaderCell}>
              <Text style={styles.boldText}>Shift</Text>
            </View>
            <View style={styles.scheduleHeaderCell}>
              <Text style={styles.boldText}>Sunday</Text>
            </View>
            <View style={styles.scheduleHeaderCell}>
              <Text style={styles.boldText}>Monday</Text>
            </View>
            <View style={styles.scheduleHeaderCell}>
              <Text style={styles.boldText}>Tuesday</Text>
            </View>
            <View style={styles.scheduleHeaderCell}>
              <Text style={styles.boldText}>Wednesday</Text>
            </View>
            <View style={styles.scheduleHeaderCell}>
              <Text style={styles.boldText}>Thursday</Text>
            </View>
            <View style={styles.scheduleHeaderCell}>
              <Text style={styles.boldText}>Friday</Text>
            </View>
            <View style={styles.scheduleHeaderCell}>
              <Text style={styles.boldText}>Saturday</Text>
            </View>
          </View>

          {/* IISS Row */}
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleCell}>
              <Text style={styles.text}>IISS</Text>
            </View>
            {Array(7)
              .fill(null)
              .map((_, i) => (
                <View key={i} style={styles.scheduleCell}>
                  <Text style={styles.text}>
                    {serviceNeeds?.iiss ? "✓" : ""}
                  </Text>
                </View>
              ))}
          </View>

          {/* RC Row */}
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleCell}>
              <Text style={styles.text}>RC</Text>
            </View>
            {Array(7)
              .fill(null)
              .map((_, i) => (
                <View key={i} style={styles.scheduleCell}>
                  <Text style={styles.text}>
                    {serviceNeeds?.respite ? "✓" : ""}
                  </Text>
                </View>
              ))}
          </View>

          {/* FC Row */}
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleCell}>
              <Text style={styles.text}>FC</Text>
            </View>
            {Array(7)
              .fill(null)
              .map((_, i) => (
                <View key={i} style={styles.scheduleCell}>
                  <Text style={styles.text}>
                    {serviceNeeds?.familyTraining ? "✓" : ""}
                  </Text>
                </View>
              ))}
          </View>

          {/* TI Row */}
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleCell}>
              <Text style={styles.text}>TI</Text>
            </View>
            {Array(7)
              .fill(null)
              .map((_, i) => (
                <View key={i} style={styles.scheduleCell}>
                  <Text style={styles.text}>
                    {serviceNeeds?.therapeuticServices ? "✓" : ""}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {/* Daily Activities */}
        <Text style={styles.scheduleSubTitle}>Summary of Daily Activities</Text>
        <Text style={styles.text}>
          Below is a Summary of My Daily Activities
        </Text>

        <View style={styles.dailyActivitiesTable}>
          <View style={styles.dailyActivitiesRow}>
            <View
              style={[styles.dailyActivitiesHeaderCell, styles.startTimeCell]}
            >
              <Text style={styles.boldText}>Start Time</Text>
            </View>
            <View
              style={[styles.dailyActivitiesHeaderCell, styles.stopTimeCell]}
            >
              <Text style={styles.boldText}>Stop Time</Text>
            </View>
            <View
              style={[styles.dailyActivitiesHeaderCell, styles.monToFriCell]}
            >
              <Text style={styles.boldText}>Mon to Fri</Text>
            </View>
            <View
              style={[styles.dailyActivitiesHeaderCell, styles.saturdayCell]}
            >
              <Text style={styles.boldText}>Saturday</Text>
            </View>
            <View style={[styles.dailyActivitiesHeaderCell, styles.sundayCell]}>
              <Text style={styles.boldText}>Sunday</Text>
            </View>
          </View>
          <View style={styles.dailyActivitiesRow}>
            <View style={[styles.dailyActivitiesCell, styles.startTimeCell]}>
              <Text style={styles.text}></Text>
            </View>
            <View style={[styles.dailyActivitiesCell, styles.stopTimeCell]}>
              <Text style={styles.text}></Text>
            </View>
            <View style={[styles.dailyActivitiesCell, styles.monToFriCell]}>
              <Text style={styles.text}></Text>
            </View>
            <View style={[styles.dailyActivitiesCell, styles.saturdayCell]}>
              <Text style={styles.text}></Text>
            </View>
            <View style={[styles.dailyActivitiesCell, styles.sundayCell]}>
              <Text style={styles.text}></Text>
            </View>
          </View>
        </View>

        {/* Signature Line */}
        <View style={[styles.signature, { marginTop: 20 }]}>
          <Text style={styles.boldText}>Signature:</Text>
        </View>

        {/* Authorization Text */}
        <View style={styles.signature}>
          <View>
            <Text style={styles.boldText}>
              I, {authorization?.creator_name}, acknowledge that on{" "}
              {formatDate(authorization?.createdAt)}, understood and received a
              copy of the Specific Needs Management. I agree to continue to
              abide by all Creed Business Policies and Procedures.
            </Text>
          </View>
          {authorization?.signature_url && (
            <Image
              src={authorization.signature_url}
              style={styles.signatureImage}
            />
          )}
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 3/3</Text>
      </Page>
    </Document>
  );
};

export default SpecificNeedsPdf;
