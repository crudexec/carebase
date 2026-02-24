"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MedicationForm } from "@/components/emar/medications/medication-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function EditMedicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-4">
      <Breadcrumb
        items={[
          { label: "eMAR", href: "/emar" },
          { label: "Medications", href: "/emar/medications" },
          { label: "Edit Medication" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Medication</h1>
        <p className="text-muted-foreground">
          Update medication details below
        </p>
      </div>

      <MedicationForm
        medicationId={id}
        onSuccess={() => router.push(`/emar/medications/${id}`)}
        onCancel={() => router.push(`/emar/medications/${id}`)}
      />
    </div>
  );
}
