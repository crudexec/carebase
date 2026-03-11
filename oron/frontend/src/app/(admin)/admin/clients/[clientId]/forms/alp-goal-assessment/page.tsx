"use client";

import AlpGoalAssessmentWrapper from "@/components/clients/client-details/client-forms/alp-goal-assessment/AlpGoalAssessmentWrapper";
import PageContainer from "@/components/PageContainer";
import { toast } from "@/components/ui/use-toast";
import { useParams, useSearchParams, useRouter } from "next/navigation";

const AlpGoalAssessmentPage = () => {
  const router = useRouter();
  const { clientId } = useParams<{ clientId: string }>();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");

  if (!formId) {
    toast({
      variant: "destructive",
      description: "Treatment Plan ID Must Be Valid",
    });
    router.push(`/admin/clients/${clientId}`);
  }

  return (
    <PageContainer>
      <AlpGoalAssessmentWrapper
        clientId={clientId}
        formId={formId}
        admin={true}
      />
    </PageContainer>
  );
};

export default AlpGoalAssessmentPage;
