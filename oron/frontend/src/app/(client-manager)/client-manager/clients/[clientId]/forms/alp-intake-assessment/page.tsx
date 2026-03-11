"use client";

import AlpIntakeAssessmentWrapper from "@/components/clients/client-details/client-forms/alp-intake-assessment/AlpIntakeAssessmentWrapper";
import PageContainer from "@/components/PageContainer";
import { toast } from "@/components/ui/use-toast";
import { useParams, useSearchParams, useRouter } from "next/navigation";

const ClientManagerAlpIntakeAssessmentPage = () => {
  const router = useRouter();
  const { clientId } = useParams<{ clientId: string }>();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");

  if (!formId) {
    toast({
      variant: "destructive",
      description: "Treatment Plan ID Must Be Valid",
    });
    router.push(`/client-manager/clients/${clientId}`);
  }

  return (
    <PageContainer>
      <AlpIntakeAssessmentWrapper
        clientId={clientId}
        formId={formId}
        admin={true}
        clientManager={true}
      />
    </PageContainer>
  );
};

export default ClientManagerAlpIntakeAssessmentPage;
