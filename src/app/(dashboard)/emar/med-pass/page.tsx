"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Pill, Loader2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MedPassView } from "@/components/emar/med-pass/med-pass-view";

function MedPassContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || undefined;

  return <MedPassView initialClientId={clientId} />;
}

export default function MedPassPage() {
  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "eMAR", href: "/emar" },
          { label: "Med Pass" },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Pill className="h-6 w-6" />
          Medication Pass
        </h1>
        <p className="text-muted-foreground">
          Administer and document scheduled medications
        </p>
      </div>

      {/* Med Pass View */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <MedPassContent />
      </Suspense>
    </div>
  );
}
