"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { UnifiedClientForm } from "@/components/clients/unified-client-form";

export default function NewClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const referralId = searchParams.get("referralId");

  React.useEffect(() => {
    if (session?.user?.role === "SPONSOR") {
      router.replace("/clients");
    }
  }, [router, session?.user?.role]);

  const handleSuccess = (result: { type: "referral" | "client"; id: string }) => {
    if (result.type === "referral") {
      router.push(`/referrals/${result.id}`);
    } else {
      router.push(`/clients/${result.id}`);
    }
  };

  if (status === "loading" || session?.user?.role === "SPONSOR") {
    return null;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <UnifiedClientForm
        referralId={referralId || undefined}
        defaultExpanded={!!referralId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
