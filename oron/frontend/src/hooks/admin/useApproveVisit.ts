"use client";

import { useState } from "react";
import { approveVisit } from "@/actions/admin/visit-approval";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useToast } from "@/components/ui/use-toast";

const useApproveVisit = (visitId: string) => {
  const { toast } = useToast();
  const [hasApproved, setHasApproved] = useState<boolean>(false);
  const token = localStorage.getItem("token") as string;

  const { ...props } = useCustomMutation<string>(
    async (_: any) => {
      const response = await approveVisit(token, visitId);

      if (!response) {
        return toast({
          description: "An error occurred while approving visit, try again",
          variant: "destructive",
        });
      }

      setHasApproved(true);

      return toast({
        description: "Visit note has been approved successfully",
        variant: "success",
      });
    },
    ["visitData"]
  );

  return { ...props, hasApproved, visitId };
};

export default useApproveVisit;
