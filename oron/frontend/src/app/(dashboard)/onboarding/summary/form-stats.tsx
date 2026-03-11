"use client";

import { useState, useEffect, useCallback } from "react";
import StatCard from "./stat-card";
import useForms from "@/hooks/forms/useForms";

const FormStats = () => {
  const { data: formStatusData, isLoading } = useForms();

  const [formStat, setFormStat] = useState({
    notFilled: 0,
    awaitingApproval: 0,
    correctionRequired: 0,
    completed: 0,
  });
  const [formPercentage, setFormPercentage] = useState({
    notFilled: 0,
    awaitingApproval: 0,
    correctionRequired: 0,
    completed: 0,
  });

  const handleFormStatusLogic = useCallback(() => {
    if (formStatusData) {
      const totalForms = 11;
      const statuses = Object.values(formStatusData.status);

      const notFilledCount = statuses.filter(
        (status) => status === "Not Filled"
      ).length;
      const awaitingApprovalCount = statuses.filter(
        (status) => status === "Awaiting Approval"
      ).length;
      const correctionRequiredCount = statuses.filter(
        (status) => status === "Correction Required"
      ).length;
      const completedCount = statuses.filter(
        (status) => status === "Approved"
      ).length;

      const notFilledPercentage = Math.round(
        (notFilledCount / totalForms) * 100
      );
      const awaitingApprovalPercentage = Math.round(
        (awaitingApprovalCount / totalForms) * 100
      );
      const correctionRequiredPercentage = Math.round(
        (correctionRequiredCount / totalForms) * 100
      );
      const completedPercentage = Math.round(
        (completedCount / totalForms) * 100
      );

      setFormStat({
        notFilled: notFilledCount,
        awaitingApproval: awaitingApprovalCount,
        correctionRequired: correctionRequiredCount,
        completed: completedCount,
      });

      setFormPercentage({
        notFilled: notFilledPercentage,
        awaitingApproval: awaitingApprovalPercentage,
        correctionRequired: correctionRequiredPercentage,
        completed: completedPercentage,
      });
    }
  }, [formStatusData]);

  useEffect(() => {
    handleFormStatusLogic();
  }, [handleFormStatusLogic, formStatusData]);

  return (
    <div className="w-full grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 place-content-between">
      <StatCard
        type="Not Filled"
        number={formStat.notFilled.toString()}
        percentage={formPercentage.notFilled}
        chartColour="#EF4444"
        isLoading={isLoading}
      />
      <StatCard
        type="Awaiting Approval"
        number={formStat.awaitingApproval.toString()}
        percentage={formPercentage.awaitingApproval}
        chartColour="#475569"
        isLoading={isLoading}
      />
      <StatCard
        type="Correction Required"
        number={formStat.correctionRequired.toString()}
        percentage={formPercentage.correctionRequired}
        chartColour="#F79009"
        isLoading={isLoading}
      />
      <StatCard
        type="Completed"
        number={formStat.completed.toString()}
        percentage={formPercentage.completed}
        chartColour="#12B76A"
        isLoading={isLoading}
      />
    </div>
  );
};

export default FormStats;
