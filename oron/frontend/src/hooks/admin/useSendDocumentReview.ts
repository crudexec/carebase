"use client";

import { useState } from "react";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useToast } from "@/components/ui/use-toast";
import { sendDocumentReview } from "@/actions/admin/send-review";

const useSendDocumentReview = (
  name: string,
  documentId: string,
  userId: string
) => {
  const { toast } = useToast();
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [reviewNote, setReviewNote] = useState<string>("");

  const handleChange = (value: string) => {
    setReviewNote(value);
  };

  const token = localStorage.getItem("token") as string;

  const { ...props } = useCustomMutation<string>(
    async (_: any) => {
      if (reviewNote.length < 1) {
        return toast({
          description: "Please enter review note",
          variant: "destructive",
        });
      }

      const response = await sendDocumentReview(token, documentId, reviewNote);

      if (!response) {
        return toast({
          description: "Something went wrong! Please try again!",
          variant: "destructive",
        });
      }
      setReviewNote("");
      setHasReviewed(true);

      return toast({
        description: `Review Has Been Sent To ${name} Succesfully`,
        variant: "success",
      });
    },

    ["userDocument", userId]
  );

  return { ...props, hasReviewed, reviewNote, handleChange };
};

export default useSendDocumentReview;
