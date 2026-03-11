"use client";

import { useEffect } from "react";
import PageContainer from "@/components/PageContainer";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import SpecificNeedsPageWrapper from "@/components/clients/client-details/client-forms/specific-needs/SpecificNeedsPageWrapper";

const ClientManagerSpecificNeedsPage = () => {
  const searchParams = useSearchParams();
  const params = useParams<{ clientId: string }>();
  const mode = searchParams.get("mode");
  const clientId = params.clientId;
  const router = useRouter();

  useEffect(() => {
    if (!mode || (mode !== "edit" && mode !== "view") || !clientId) {
      router.back();
    }
  }, [mode, router, clientId]);

  return (
    <PageContainer>
      <SpecificNeedsPageWrapper
        isEditing={mode === "edit"}
        isViewing={mode === "view"}
        clientId={clientId ?? ""}
        admin={true}
        clientManager={true}
      />
    </PageContainer>
  );
};

export default ClientManagerSpecificNeedsPage;
