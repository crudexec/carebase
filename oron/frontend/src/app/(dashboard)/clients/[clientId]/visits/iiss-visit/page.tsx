"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { VisitingFormProvider } from "@/components/clients/client-details/client-visits/visit-form/store/visiting-form-context";
import VisitFormPageWrapper from "@/components/clients/client-details/client-visits/visit-form/view/VisitFormPageWrapper";
import PageContainer from "@/components/PageContainer";

const IISSEmployeeVisitPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const searchParams = useSearchParams();
  const dateOfSession = searchParams.get("date_of_session");
  const startTime = searchParams.get("start_time");
  const endTime = searchParams.get("end_time");
  const formId = searchParams.get("formId");

  const router = useRouter();

  if (!formId) {
    router.push(`/clients/${clientId}`);
    return;
  }

  return (
    <PageContainer>
      <VisitingFormProvider>
        <VisitFormPageWrapper
          dateOfSession={dateOfSession}
          startTime={startTime}
          endTime={endTime}
          formId={formId}
        />
      </VisitingFormProvider>
    </PageContainer>
  );
};

export default IISSEmployeeVisitPage;
