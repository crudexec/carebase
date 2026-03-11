"use client";

import { useState, useEffect } from "react";
import { UserFormInfo } from "@/types/AdminTypes";
import {
  GeneratedFormType,
  GeneratedFormStatusWithIndex,
  GeneratedFormDateWithIndex,
} from "@/types/form-types/FormTypes";
import { FormTableContainer } from "@/components/forms/Columns";
import { format } from "date-fns";

type TabValue = "inProgress" | "awaitingApproval" | "approved" | "notFilled";

const useTabChange = (
  formData: FormTableContainer[],
  allFormsData: GeneratedFormType | UserFormInfo
) => {
  const [filteredData, setFilteredData] =
    useState<FormTableContainer[]>(formData);

  useEffect(() => {
    setFilteredData(formData);
  }, [formData]);

  const handleTabChange = (tabValue: string) => {
    let filtered;
    switch (tabValue) {
      case "inProgress":
        filtered = formData.filter((item) => item.status === "In Progress");
        break;
      case "awaitingApproval":
        filtered = formData.filter(
          (item) => item.status === "Awaiting Approval"
        );
        break;
      case "approved":
        filtered = formData.filter((item) => item.status === "Approved");
        break;
      case "notFilled":
        filtered = formData.filter((item) => item.status === "Not Filled");
        break;
        case "signed":
          filtered = formData.filter((item) => item.status === "Signed");
          break;
      default:
        filtered = formData.slice();
        break;
    }

    const updatedFilteredData = filtered.map((form) => {
      const isOfferLetter = form.id === "offerLetter";
      const offerLetter = formData.find((item) => item.id === "offerLetter");

      const startDate =
        allFormsData?.createdDate &&
        typeof allFormsData.createdDate !== "boolean"
          ? (allFormsData.createdDate as GeneratedFormDateWithIndex)[form.id]
          : null;

      const submittedDate =
        allFormsData?.submittedDate &&
        typeof allFormsData.submittedDate !== "boolean"
          ? (allFormsData.submittedDate as GeneratedFormDateWithIndex)[form.id]
          : null;

      const formattedStartDate =
        startDate && !isNaN(new Date(startDate).getTime())
          ? format(new Date(startDate), "PPP")
          : "";

      const formattedSubmittedDate =
        submittedDate && !isNaN(new Date(submittedDate).getTime())
          ? format(new Date(submittedDate), "PPP")
          : "";

      const progress = isOfferLetter
        ? offerLetter?.progress?.toString()
        : allFormsData?.progress && typeof allFormsData.progress !== "boolean"
        ? (allFormsData.progress as GeneratedFormDateWithIndex)[form.id]
        : null;

      return {
        ...form,
        status: isOfferLetter
          ? offerLetter?.status!
          : allFormsData?.status && typeof allFormsData.status !== "boolean"
          ? (allFormsData.status as GeneratedFormStatusWithIndex)[form.id]
          : form.status,
        started: isOfferLetter ? offerLetter?.started! : formattedStartDate,
        submittedDate: isOfferLetter
          ? offerLetter?.submittedDate!
          : formattedSubmittedDate,
        progress: progress ? parseInt(progress) : 0,
      };
    });

    setFilteredData(updatedFilteredData);
  };

  return { filteredData, handleTabChange };
};

export default useTabChange;
