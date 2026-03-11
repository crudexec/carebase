"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { VisitingFormProvider } from "@/components/clients/client-details/client-visits/visit-form/store/visiting-form-context";
import VisitFormPageWrapper from "@/components/clients/client-details/client-visits/visit-form/view/VisitFormPageWrapper";
import PageContainer from "@/components/PageContainer";

const VisitPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");

  const router = useRouter();

  if (!formId) {
    router.push(`/admin/clients/${clientId}`);
    return;
  }

  return (
    <PageContainer>
      <VisitingFormProvider>
        <VisitFormPageWrapper formId={formId} admin={true} />
      </VisitingFormProvider>
    </PageContainer>
  );
};

export default VisitPage;
