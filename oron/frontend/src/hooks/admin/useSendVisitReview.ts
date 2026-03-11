"use client";

import { useState } from "react";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useToast } from "@/components/ui/use-toast";
import { sendVisitReview } from "@/actions/admin/visit-approval";

const useSendVisitReview = (visitId: string) => {
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

      const response = await sendVisitReview(token, visitId, reviewNote);

      if (!response) {
        return toast({
          description: "Something went wrong! Please try again!",
          variant: "destructive",
        });
      }

      setReviewNote("");
      setHasReviewed(true);

      return toast({
        description: "Review has been sent successfully",
        variant: "success",
      });
    },
    ["visitData"]
  );

  return { ...props, hasReviewed, visitId, reviewNote, handleChange };
};

export default useSendVisitReview;
