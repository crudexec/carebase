"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import FcVisitFormWrapper from "@/components/clients/client-details/client-visits/fc-visit-form/FcVisitFormWrapper";

const ClientManagerFcVisitPage = () => {
  const { clientId } = useParams<{ clientId: string }>();

  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");

  const router = useRouter();

  if (!formId) {
    router.push(`/client-manager/clients/${clientId}`);
    return;
  }

  return (
    <PageContainer>
      <FcVisitFormWrapper formId={formId} admin={true} clientManager={true} clientId={clientId} />
    </PageContainer>
  );
};

export default ClientManagerFcVisitPage;
