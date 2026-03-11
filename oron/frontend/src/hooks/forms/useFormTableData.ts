"use client";

import { useState, useEffect } from "react";
import {
  GeneratedFormStatus,
  GeneratedFormDate,
  GeneratedFormStatusWithIndex,
  GeneratedFormDateWithIndex,
} from "@/types/form-types/FormTypes";
import { format } from "date-fns";
import { FormTableContainer } from "@/components/forms/Columns";

type FormDateTypes = GeneratedFormDate | boolean | undefined;

// Custom hook to manage form table data
const useFormTableData = (
  formStatusData: GeneratedFormStatus | boolean | undefined,
  formSubmittedDateData: FormDateTypes,
  formProgress: FormDateTypes,
  initialData: FormTableContainer[],
  formCreatedDateData?: FormDateTypes,
  formIds?: FormDateTypes
) => {
  // State to store the updated form data for the table
  const [formData, setFormData] = useState<FormTableContainer[]>(initialData);

  // Effect to update form status in the data
  useEffect(() => {
    if (formStatusData && typeof formStatusData !== "boolean") {
      // Updating form status based on the provided data
      const updatedStatusData = initialData?.map((form) => ({
        ...form,
        status: (formStatusData as GeneratedFormStatusWithIndex)?.[form.id],
      }));
      // Updating the form data state
      setFormData((prevFilteredData) => {
        const updatedFormsMap = new Map(
          updatedStatusData?.map((form) => [form.id, form])
        );
        return prevFilteredData?.map((prevForm) => {
          const updatedForm = updatedFormsMap?.get(prevForm.id);
          return updatedForm
            ? { ...prevForm, status: updatedForm.status }
            : prevForm;
        });
      });
    }
  }, [formStatusData, initialData]);

  // Effect to update submitted date in the data
  useEffect(() => {
    if (formSubmittedDateData && typeof formSubmittedDateData !== "boolean") {
      // Updating submitted date based on the provided data
      const updatedSubmittedDateData = initialData?.map((form) => {
        const submittedDate = (
          formSubmittedDateData as GeneratedFormDateWithIndex
        )?.[form.id];
        if (submittedDate && !isNaN(new Date(submittedDate)?.getTime())) {
          return {
            ...form,
            submittedDate: format(new Date(submittedDate), "PPP"),
          };
        } else {
          return {
            ...form,
            submittedDate: "",
          };
        }
      });

      const updatedForms = updatedSubmittedDateData?.map((updatedForm) => ({
        ...updatedForm,
        submittedDate: updatedForm.submittedDate,
      }));

      const getUpdatedForm = (prevFormId: string) =>
        updatedForms?.find((updatedForm) => updatedForm.id === prevFormId);

      // Updating the form data state
      setFormData((prevFilteredData) => {
        return prevFilteredData?.map((prevForm) => {
          const updatedForm = getUpdatedForm(prevForm.id);
          return updatedForm
            ? {
                ...prevForm,
                submittedDate: updatedForm.submittedDate,
              }
            : prevForm;
        });
      });
    }
  }, [formSubmittedDateData, initialData]);

  // Effect to update progress in the data
  useEffect(() => {
    if (formProgress && typeof formProgress !== "boolean") {
      // Updating progress based on the provided data
      const updatedProgress = initialData?.map((form) => {
        const progress = (formProgress as GeneratedFormDateWithIndex)?.[
          form.id
        ];
        return {
          ...form,
          progress: progress ? parseInt(progress) : 0,
        };
      });

      const getUpdatedForm = (prevFormId: string) =>
        updatedProgress?.find((updatedForm) => updatedForm.id === prevFormId);

      // Updating the form data state
      setFormData((prevFilteredData) => {
        return prevFilteredData?.map((prevForm) => {
          const updatedForm = getUpdatedForm(prevForm.id);
          return updatedForm
            ? { ...prevForm, progress: updatedForm.progress }
            : prevForm;
        });
      });
    }
  }, [formProgress, initialData]);

  // Effect to update created date in the data
  useEffect(() => {
    if (
      formCreatedDateData &&
      typeof formCreatedDateData !== "boolean" &&
      formCreatedDateData
    ) {
      // Updating created date based on the provided data
      const updatedStartedData = initialData?.map((form) => {
        const started = (formCreatedDateData as GeneratedFormDateWithIndex)?.[
          form.id
        ];

        return {
          ...form,
          started:
            started && started !== "undefined" && started.length > 5
              ? format(new Date(started), "PPP")
              : "",
        };
      });

      const getUpdatedForm = (prevFormId: string) =>
        updatedStartedData?.find(
          (updatedForm) => updatedForm.id === prevFormId
        );

      // Updating the form data state
      setFormData((prevFilteredData) => {
        return prevFilteredData?.map((prevForm) => {
          const updatedForm = getUpdatedForm(prevForm.id);
          return updatedForm
            ? { ...prevForm, started: updatedForm.started }
            : prevForm;
        });
      });
    }
  }, [formCreatedDateData, initialData]);

  // Effect to update form IDs in the data
  useEffect(() => {
    if (formIds && typeof formIds !== "boolean" && formIds) {
      // Updating form IDs based on the provided data
      const updatedFormId = initialData?.map((form) => {
        const id = (formIds as GeneratedFormDateWithIndex)?.[form.id];

        return {
          ...form,
          formId: id ?? "-",
        };
      });

      const getUpdatedForm = (prevFormId: string) =>
        updatedFormId?.find((updatedForm) => updatedForm.id === prevFormId);

      // Updating the form data state
      setFormData((prevFilteredData) => {
        return prevFilteredData?.map((prevForm) => {
          const updatedForm = getUpdatedForm(prevForm.id);
          return updatedForm
            ? { ...prevForm, formId: updatedForm.formId }
            : prevForm;
        });
      });
    }
  }, [formIds, initialData]);

  return { formData };
};

export default useFormTableData;
