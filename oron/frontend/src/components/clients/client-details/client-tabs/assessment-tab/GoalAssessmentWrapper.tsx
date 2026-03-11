"use client";

import { GoalAssessmentTable } from "./GoalAssessmentTable";
import { GoalAssessmentTableTypes } from "./GoalAssessmentColumns";
import { TreatmentPlan } from "@/types/Events";
import { TreatmentPlanFormTabOptionIdType } from "../../ClientDetailPageWrapper";
import { formatDate, formatLastModified } from "@/utils/helpers";

interface Props {
  admin?: boolean;
  treatmentPlanData: TreatmentPlan | undefined;
  filteredData: GoalAssessmentTableTypes[];
  formType: TreatmentPlanFormTabOptionIdType;
}

const GoalAssessmentWrapper = ({
  admin,
  treatmentPlanData,
  filteredData,
  formType,
}: Props) => {
  const modifiedData = filteredData.filter((data) => {
    if (!admin) {
      return (
        data?.status === "completed" ||
        data?.status === "awaiting_signature" ||
        data?.status === "signed" ||
        data?.status === "not_sent"
      );
    }
    return true;
  });

  return (
    <section className="w-full flex flex-col gap-5">
      <GoalAssessmentTable data={modifiedData} />
    </section>
  );
};

export default GoalAssessmentWrapper;
