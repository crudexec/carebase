"use client";

import TreatmentPlanWrapper from "@/components/clients/client-details/client-forms/treatment-plan-form/TreatmentPlanWrapper";
import PageContainer from "@/components/PageContainer";
import { toast } from "@/components/ui/use-toast";
import { useParams, useSearchParams, useRouter } from "next/navigation";

const FcTreatmentPlanPage = () => {
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
      <TreatmentPlanWrapper
        clientId={clientId}
        formType="fc"
        admin={true}
        formId={formId!}
      />
    </PageContainer>
  );
};

export default FcTreatmentPlanPage;
