"use client";

import { useRouter } from "next/navigation";
import { MedicationList } from "@/components/emar/medications/medication-list";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function MedicationsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-6 space-y-4">
      <Breadcrumb
        items={[
          { label: "eMAR", href: "/emar" },
          { label: "Medications" },
        ]}
      />
      <MedicationList
        showClientColumn={true}
        onAddClick={() => router.push("/emar/medications/new")}
      />
    </div>
  );
}
