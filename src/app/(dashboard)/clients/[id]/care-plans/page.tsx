"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Breadcrumb,
} from "@/components/ui";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  FileText,
  Calendar,
  User,
  ChevronRight,
} from "lucide-react";

interface CarePlan {
  id: string;
  status: string;
  effectiveDate: string | null;
  endDate: string | null;
  certStartDate: string | null;
  certEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  physician: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  caseManager: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  _count?: {
    diagnoses: number;
    orders: number;
  };
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_CLINICAL_REVIEW: "Pending Review",
  CLINICAL_APPROVED: "Approved",
  PENDING_CLIENT_SIGNATURE: "Pending Signature",
  ACTIVE: "Active",
  REVISED: "Revised",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, "primary" | "success" | "warning" | "error" | "default"> = {
  DRAFT: "default",
  PENDING_CLINICAL_REVIEW: "warning",
  CLINICAL_APPROVED: "primary",
  PENDING_CLIENT_SIGNATURE: "warning",
  ACTIVE: "success",
  REVISED: "primary",
  COMPLETED: "success",
  CANCELLED: "error",
};

export default function ClientCarePlansPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = React.useState<Client | null>(null);
  const [carePlans, setCarePlans] = React.useState<CarePlan[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch client
      const clientRes = await fetch(`/api/clients/${clientId}`);
      if (!clientRes.ok) throw new Error("Failed to fetch client");
      const clientData = await clientRes.json();
      setClient(clientData.client);

      // Fetch care plans
      const carePlansRes = await fetch(`/api/care-plans?clientId=${clientId}`);
      if (!carePlansRes.ok) throw new Error("Failed to fetch care plans");
      const carePlansData = await carePlansRes.json();
      setCarePlans(carePlansData.carePlans || []);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Clients", href: "/clients" },
            { label: "Client", href: `/clients/${clientId}` },
            { label: "Plans of Care" },
          ]}
        />
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Clients", href: "/clients" },
          { label: client ? `${client.firstName} ${client.lastName}` : "Client", href: `/clients/${clientId}` },
          { label: "Plans of Care" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Plans of Care</h1>
          {client && (
            <p className="text-body-sm text-foreground-secondary mt-1">
              {client.firstName} {client.lastName}
            </p>
          )}
        </div>
        <Button onClick={() => router.push(`/clients/${clientId}/care-plans/new`)}>
          <Plus className="w-4 h-4 mr-2" />
          New Plan of Care
        </Button>
      </div>

      {/* Care Plans List */}
      {carePlans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary mb-4">
              No plans of care have been created for this client yet.
            </p>
            <Button onClick={() => router.push(`/clients/${clientId}/care-plans/new`)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Plan of Care
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {carePlans.map((carePlan) => (
            <Card
              key={carePlan.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                router.push(`/clients/${clientId}/care-plans/${carePlan.id}`)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_COLORS[carePlan.status] || "default"}>
                          {STATUS_LABELS[carePlan.status] || carePlan.status}
                        </Badge>
                        {carePlan.certStartDate && carePlan.certEndDate && (
                          <span className="text-sm text-foreground-secondary">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDate(carePlan.certStartDate)} -{" "}
                            {formatDate(carePlan.certEndDate)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-foreground-secondary">
                        {carePlan.physician && (
                          <span>
                            <User className="w-3 h-3 inline mr-1" />
                            Dr. {carePlan.physician.firstName}{" "}
                            {carePlan.physician.lastName}
                          </span>
                        )}
                        {carePlan._count && (
                          <>
                            <span>{carePlan._count.diagnoses} diagnoses</span>
                            <span>{carePlan._count.orders} orders</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-foreground-tertiary">
                      <p>Created {formatDate(carePlan.createdAt)}</p>
                      <p>Updated {formatDate(carePlan.updatedAt)}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-foreground-tertiary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
