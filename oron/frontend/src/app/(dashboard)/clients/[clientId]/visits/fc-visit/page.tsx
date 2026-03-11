"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import FcVisitFormWrapper from "@/components/clients/client-details/client-visits/fc-visit-form/FcVisitFormWrapper";

const FcVisitEmployeePage = () => {
  const { clientId } = useParams<{ clientId: string }>();

  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");

  const router = useRouter();

  if (!formId) {
    router.push(`/clients/${clientId}`);
    return;
  }

  return (
    <PageContainer>
      <FcVisitFormWrapper formId={formId} admin={false} clientId={clientId} />
    </PageContainer>
  );
};

export default FcVisitEmployeePage;
