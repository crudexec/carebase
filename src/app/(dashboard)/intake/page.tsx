"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  Badge,
} from "@/components/ui";
import {
  Plus,
  Search,
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";

interface Intake {
  id: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  scheduledDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  coordinator: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  assessments: {
    id: string;
    status: string;
    template: {
      name: string;
    };
  }[];
  consents: {
    id: string;
    status: string;
    template: {
      name: string;
    };
  }[];
  carePlan: {
    id: string;
    status: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SCHEDULED: { label: "Scheduled", color: "bg-primary/10 text-primary", icon: Calendar },
  IN_PROGRESS: { label: "In Progress", color: "bg-warning/10 text-warning", icon: Clock },
  PENDING_APPROVAL: { label: "Pending Approval", color: "bg-secondary/10 text-secondary", icon: AlertCircle },
  APPROVED: { label: "Approved", color: "bg-success/10 text-success", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "bg-error/10 text-error", icon: XCircle },
  CANCELLED: { label: "Cancelled", color: "bg-foreground/10 text-foreground-secondary", icon: XCircle },
};

export default function IntakePage() {
  const [intakes, setIntakes] = React.useState<Intake[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  React.useEffect(() => {
    fetchIntakes();
  }, [statusFilter]);

  const fetchIntakes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "50");

      const response = await fetch(`/api/intake?${params}`);
      const data = await response.json();

      if (response.ok) {
        setIntakes(data.intakes || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch intakes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIntakes = intakes.filter((intake) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      intake.client.firstName.toLowerCase().includes(searchLower) ||
      intake.client.lastName.toLowerCase().includes(searchLower)
    );
  });

  const getProgress = (intake: Intake) => {
    const assessmentsDone = intake.assessments.filter((a) => a.status === "COMPLETED").length;
    const consentsDone = intake.consents.filter((c) => c.status === "SIGNED").length;
    const steps = [
      true, // Step 1: Client info always done
      assessmentsDone > 0,
      consentsDone > 0,
      intake.carePlan !== null,
      intake.status === "APPROVED",
    ];
    return steps.filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Intake Management</h1>
          <p className="text-foreground-secondary">
            Patient intake and onboarding workflow
          </p>
        </div>
        <Link href="/intake/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Intake
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {intakes.filter((i) => i.status === "SCHEDULED").length}
                </p>
                <p className="text-sm text-foreground-secondary">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {intakes.filter((i) => i.status === "IN_PROGRESS").length}
                </p>
                <p className="text-sm text-foreground-secondary">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-secondary/10">
                <AlertCircle className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {intakes.filter((i) => i.status === "PENDING_APPROVAL").length}
                </p>
                <p className="text-sm text-foreground-secondary">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {intakes.filter((i) => i.status === "APPROVED").length}
                </p>
                <p className="text-sm text-foreground-secondary">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                <Input
                  placeholder="Search by client name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[180px]"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Intake List */}
      <Card>
        <CardHeader>
          <CardTitle>Intakes ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredIntakes.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="mx-auto h-12 w-12 text-foreground-secondary/50" />
              <h3 className="mt-4 text-lg font-medium">No intakes found</h3>
              <p className="mt-2 text-sm text-foreground-secondary">
                {search || statusFilter
                  ? "Try adjusting your filters"
                  : "Get started by creating a new intake"}
              </p>
              {!search && !statusFilter && (
                <Link href="/intake/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    New Intake
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIntakes.map((intake) => {
                const statusConfig = STATUS_CONFIG[intake.status] || STATUS_CONFIG.IN_PROGRESS;
                const StatusIcon = statusConfig.icon;
                const progress = getProgress(intake);

                return (
                  <Link
                    key={intake.id}
                    href={`/intake/${intake.id}`}
                    className="block"
                  >
                    <div className="p-4 rounded-lg border hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${statusConfig.color}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {intake.client.firstName} {intake.client.lastName}
                            </h3>
                            {intake.coordinator && (
                              <p className="text-sm text-foreground-secondary">
                                Coordinator: {intake.coordinator.firstName} {intake.coordinator.lastName}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-foreground-secondary">Progress</span>
                          <span className="font-medium">{progress} / 5 steps</span>
                        </div>
                        <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${(progress / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-foreground-secondary">
                        {intake.scheduledDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Scheduled: {new Date(intake.scheduledDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <ClipboardCheck className="h-3 w-3" />
                          Assessments: {intake.assessments.filter((a) => a.status === "COMPLETED").length}/{intake.assessments.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Consents: {intake.consents.filter((c) => c.status === "SIGNED").length}/{intake.consents.length}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
