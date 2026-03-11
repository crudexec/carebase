"use client";

import { useState } from "react";
import { approveForm } from "@/actions/admin";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

// Define a type for form names
export type FormName =
  | "biodata"
  | "reference"
  | "i9form"
  | "tb"
  | "demographic"
  | "pneumococcal"
  | "hepatitis"
  | "varicella"
  | "mmr"
  | "flu"
  | "influenza"
  | "cjis";

const useApproveForm = (
  formEndpointName: FormName,
  name: string,
  formName: string,

) => {
  const { toast } = useToast();

  const [hasApproved, setHasApproved] = useState<boolean>(false);

  const searchParams = useSearchParams();

  const formID = searchParams.get("formId");

  const token = localStorage.getItem("token") as string;

  const { ...props } = useCustomMutation<string>(
    async (_: any) => {
      

      const response = await approveForm(token, formID!, formEndpointName);

      if (!response) {
        return toast({
          description: "An error occurred while approving form, try again",
          variant: "destructive",
        });
      }

      setHasApproved(true);

      return toast({
        description: `${name} ${formName} has been approved`,
        variant: "success",
      });
    },

    ["userFormData"]
  );

  return { ...props, hasApproved, formID };
};

export default useApproveForm;
