"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function CarePlanTemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  useEffect(() => {
    // Redirect to edit page
    router.replace(`/care-plans/templates/${templateId}/edit`);
  }, [router, templateId]);

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
