"use client";

import AlpGoalAssessmentWrapper from "@/components/clients/client-details/client-forms/alp-goal-assessment/AlpGoalAssessmentWrapper";
import PageContainer from "@/components/PageContainer";
import { toast } from "@/components/ui/use-toast";
import { useParams, useSearchParams, useRouter } from "next/navigation";

const EmployeeAlpGoalAssessmentPage = () => {
  const router = useRouter();
  const { clientId } = useParams<{ clientId: string }>();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");

  if (!formId) {
    toast({
      variant: "destructive",
      description: "Treatment Plan ID Must Be Valid",
    });
    router.push(`/clients/${clientId}`);
  }

  return (
    <PageContainer>
      <AlpGoalAssessmentWrapper
        clientId={clientId}
        formId={formId}
        admin={false}
      />
    </PageContainer>
  );
};

export default EmployeeAlpGoalAssessmentPage;
