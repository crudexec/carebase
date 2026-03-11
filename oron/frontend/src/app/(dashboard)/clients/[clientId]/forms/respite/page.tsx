"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import RespiteFormWrapper from "@/components/clients/client-details/client-forms/respite-form/RespiteFormWrapper";

const EmployeeRespiteFormPage = () => {
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
      <RespiteFormWrapper formId={formId} admin={false} clientId={clientId} />
    </PageContainer>
  );
};

export default EmployeeRespiteFormPage;
