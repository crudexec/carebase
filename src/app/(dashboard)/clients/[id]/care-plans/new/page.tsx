"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, ClipboardList, CheckCircle, FileText, ArrowLeft } from "lucide-react";
import { CarePlanForm } from "@/components/care-plan";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Breadcrumb,
} from "@/components/ui";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface CarePlanTemplate {
  id: string;
  name: string;
  description: string | null;
  version: number;
  sectionCount: number;
  includesDiagnoses: boolean;
  includesGoals: boolean;
  includesInterventions: boolean;
  includesMedications: boolean;
  includesOrders: boolean;
}

export default function NewCarePlanPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = React.useState<Client | null>(null);
  const [templates, setTemplates] = React.useState<CarePlanTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<"select-template" | "fill-form">("select-template");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch client and templates in parallel
        const [clientRes, templatesRes] = await Promise.all([
          fetch(`/api/clients/${clientId}`),
          fetch("/api/care-plans/templates?status=ACTIVE&isEnabled=true"),
        ]);

        if (!clientRes.ok) {
          throw new Error("Failed to fetch client");
        }

        const clientData = await clientRes.json();
        setClient(clientData.client);

        if (templatesRes.ok) {
          const templatesData = await templatesRes.json();
          setTemplates(templatesData.templates || []);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  const handleContinue = () => {
    setStep("fill-form");
  };

  const handleBack = () => {
    setStep("select-template");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground-secondary">{error || "Client not found"}</p>
      </div>
    );
  }

  // Step 2: Fill out the care plan form
  if (step === "fill-form") {
    return (
      <CarePlanForm
        clientId={clientId}
        clientName={`${client.firstName} ${client.lastName}`}
        templateId={selectedTemplateId}
        onBack={handleBack}
      />
    );
  }

  // Step 1: Select template
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Breadcrumb
        items={[
          { label: "Clients", href: "/clients" },
          { label: `${client.firstName} ${client.lastName}`, href: `/clients/${clientId}` },
          { label: "New Care Plan" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">New Plan of Care</h1>
        <p className="text-foreground-secondary mt-1">
          Select a template or start with a blank care plan
        </p>
      </div>

      {/* Option: No template */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Standard Care Plan</CardTitle>
          <CardDescription>
            Create a care plan using the standard form without a custom template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => {
              setSelectedTemplateId(null);
              handleContinue();
            }}
            className={`w-full p-4 rounded-lg border text-left transition-colors ${
              selectedTemplateId === null
                ? "bg-primary/10 border-primary"
                : "bg-background border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-background-secondary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-foreground-secondary" />
                </div>
                <div>
                  <h3 className="font-medium">Blank Care Plan</h3>
                  <p className="text-sm text-foreground-secondary mt-1">
                    Use the standard care plan form with all sections
                  </p>
                </div>
              </div>
              <CheckCircle className={`h-5 w-5 flex-shrink-0 ${
                selectedTemplateId === null ? "text-primary" : "text-transparent"
              }`} />
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Templates */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Custom Templates</CardTitle>
            <CardDescription>
              Use a pre-configured template with custom sections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplateId(template.id);
                  handleContinue();
                }}
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  selectedTemplateId === template.id
                    ? "bg-primary/10 border-primary"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-foreground-secondary mt-1">
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-foreground-tertiary">
                        <span>v{template.version}</span>
                        <span>{template.sectionCount} custom sections</span>
                        {template.includesDiagnoses && <span>+ Diagnoses</span>}
                        {template.includesOrders && <span>+ Orders</span>}
                      </div>
                    </div>
                  </div>
                  <CheckCircle className={`h-5 w-5 flex-shrink-0 ${
                    selectedTemplateId === template.id ? "text-primary" : "text-transparent"
                  }`} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
