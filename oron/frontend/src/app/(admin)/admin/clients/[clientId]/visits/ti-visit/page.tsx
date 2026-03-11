"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import TiVisitFormWrapper from "@/components/clients/client-details/client-visits/ti-visit-form/TiVisitFormWrapper";

const TiVisitPage = () => {
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
      <TiVisitFormWrapper clientId={clientId} formId={formId} admin={true} />
    </PageContainer>
  );
};

export default TiVisitPage;
