"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MedicationForm } from "@/components/emar/medications/medication-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function NewMedicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || undefined;

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-4">
      <Breadcrumb
        items={[
          { label: "eMAR", href: "/emar" },
          { label: "Medications", href: "/emar/medications" },
          { label: "New Medication" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Medication</h1>
        <p className="text-muted-foreground">
          Enter the medication details below
        </p>
      </div>

      <MedicationForm
        clientId={clientId}
        onSuccess={() => router.push("/emar/medications")}
        onCancel={() => router.push("/emar/medications")}
      />
    </div>
  );
}
