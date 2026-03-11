"use client";

import { useState } from "react";
import { approveDocument } from "@/actions/admin/approve-form";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const useApproveDocument = (
  documentId: string,
  name: string,
  documentName: string,
  userId: string
) => {
  const { toast } = useToast();

  const [hasApproved, setHasApproved] = useState<boolean>(false);

  const token = localStorage.getItem("token") as string;

  const { ...props } = useCustomMutation<string>(
    async (_: any) => {
      const response = await approveDocument(token, documentId);

      if (!response) {
        return toast({
          description: "An error occurred while approving document, try again",
          variant: "destructive",
        });
      }

      setHasApproved(true);

      return toast({
        description: `${name} ${documentName} has been approved`,
        variant: "success",
      });
    },

    ["userDocument", userId]
  );

  return { ...props, hasApproved };
};

export default useApproveDocument;
