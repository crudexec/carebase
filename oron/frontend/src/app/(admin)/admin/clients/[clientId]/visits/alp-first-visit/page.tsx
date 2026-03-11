"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import AlpVisitWrapper from "@/components/clients/client-details/client-visits/alp-visit/AlpVisitWrapper";

const AlpFirstVisitPage = () => {
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
      <AlpVisitWrapper
        clientId={clientId}
        formId={formId}
        admin={true}
        visitType="first"
      />
    </PageContainer>
  );
};

export default AlpFirstVisitPage;
