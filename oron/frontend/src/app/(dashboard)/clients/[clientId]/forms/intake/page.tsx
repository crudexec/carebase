"use client";

import { useEffect } from "react";
import PageContainer from "@/components/PageContainer";
import NewIntakePageWrapper from "@/components/clients/new-intake/NewIntakePageWrapper";
import { useSearchParams, useRouter, useParams } from "next/navigation";

const EmployeeIntakeViewAndEditPage = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const params = useParams<{ clientId: string }>();
  const clientId = params.clientId;
  const router = useRouter();

  useEffect(() => {
    if (!mode || (mode !== "edit" && mode !== "view") || !clientId) {
      router.back();
    }
  }, [mode, router, clientId]);

  return (
    <PageContainer>
      <NewIntakePageWrapper
        isEditing={mode === "edit"}
        isViewing={mode === "view"}
        clientId={clientId ?? ""}
        admin={false}
      />
    </PageContainer>
  );
};

export default EmployeeIntakeViewAndEditPage;
