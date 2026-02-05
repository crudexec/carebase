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
  Breadcrumb,
} from "@/components/ui";
import {
  Plus,
  Search,
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  FileText,
  User,
  ChevronRight,
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  SCHEDULED: { label: "Scheduled", color: "text-primary", bgColor: "bg-primary/10", icon: Calendar },
  IN_PROGRESS: { label: "In Progress", color: "text-warning", bgColor: "bg-warning/10", icon: Clock },
  PENDING_APPROVAL: { label: "Pending Approval", color: "text-secondary", bgColor: "bg-secondary/10", icon: AlertCircle },
  APPROVED: { label: "Approved", color: "text-success", bgColor: "bg-success/10", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "text-error", bgColor: "bg-error/10", icon: XCircle },
  CANCELLED: { label: "Cancelled", color: "text-foreground-secondary", bgColor: "bg-foreground/10", icon: XCircle },
};

// Stage configuration for intake workflow
const STAGES = [
  { id: 1, name: "Client Info", short: "Info" },
  { id: 2, name: "Assessments", short: "Assess" },
  { id: 3, name: "Consents", short: "Consent" },
  { id: 4, name: "Care Plan", short: "Plan" },
  { id: 5, name: "Approval", short: "Approve" },
];

function StageIndicator({ currentStage, status }: { currentStage: number; status: string }) {
  const isCompleted = status === "APPROVED";
  const isCancelled = status === "CANCELLED" || status === "REJECTED";

  return (
    <div className="flex items-center gap-0.5">
      {STAGES.map((stage, index) => {
        const isActive = index + 1 === currentStage;
        const isDone = index + 1 < currentStage || isCompleted;
        const isLast = index === STAGES.length - 1;

        return (
          <React.Fragment key={stage.id}>
            <div
              className={`relative flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-medium transition-colors ${
                isCancelled
                  ? "bg-foreground/10 text-foreground-tertiary"
                  : isDone
                  ? "bg-success text-white"
                  : isActive
                  ? "bg-primary text-white"
                  : "bg-background-secondary text-foreground-tertiary"
              }`}
              title={stage.name}
            >
              {isDone && !isCancelled ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                stage.id
              )}
            </div>
            {!isLast && (
              <div
                className={`w-3 h-0.5 ${
                  isCancelled
                    ? "bg-foreground/10"
                    : isDone
                    ? "bg-success"
                    : "bg-background-secondary"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function getStageName(intake: Intake): string {
  if (intake.status === "APPROVED") return "Completed";
  if (intake.status === "CANCELLED") return "Cancelled";
  if (intake.status === "REJECTED") return "Rejected";
  if (intake.status === "PENDING_APPROVAL") return "Pending Approval";

  const assessmentsDone = intake.assessments.filter((a) => a.status === "COMPLETED").length;
  const consentsDone = intake.consents.filter((c) => c.status === "SIGNED").length;

  if (intake.carePlan) return "Care Plan";
  if (consentsDone > 0 || intake.consents.length > 0) return "Consents";
  if (assessmentsDone > 0 || intake.assessments.length > 0) return "Assessments";
  return "Client Info";
}

function getCurrentStage(intake: Intake): number {
  if (intake.status === "APPROVED") return 5;
  if (intake.status === "PENDING_APPROVAL") return 5;
  if (intake.status === "CANCELLED" || intake.status === "REJECTED") return 1;

  const assessmentsDone = intake.assessments.filter((a) => a.status === "COMPLETED").length;
  const consentsDone = intake.consents.filter((c) => c.status === "SIGNED").length;

  if (intake.carePlan) return 4;
  if (consentsDone > 0) return 4;
  if (intake.consents.length > 0) return 3;
  if (assessmentsDone > 0) return 3;
  if (intake.assessments.length > 0) return 2;
  return 1;
}

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

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Intake" }]} />

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

      {/* Intake Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Intakes ({total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background-secondary/50">
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">
                      Client
                    </th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">
                      Stage Progress
                    </th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">
                      Current Stage
                    </th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">
                      Assessments
                    </th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">
                      Consents
                    </th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">
                      Care Plan
                    </th>
                    <th className="text-left text-xs font-medium text-foreground-secondary px-4 py-3">
                      Created
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredIntakes.map((intake) => {
                    const statusConfig = STATUS_CONFIG[intake.status] || STATUS_CONFIG.IN_PROGRESS;
                    const StatusIcon = statusConfig.icon;
                    const currentStage = getCurrentStage(intake);
                    const stageName = getStageName(intake);
                    const assessmentsDone = intake.assessments.filter((a) => a.status === "COMPLETED").length;
                    const consentsDone = intake.consents.filter((c) => c.status === "SIGNED").length;

                    return (
                      <tr
                        key={intake.id}
                        className="hover:bg-background-secondary/30 transition-colors cursor-pointer group"
                        onClick={() => window.location.href = `/intake/${intake.id}`}
                      >
                        {/* Client */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {intake.client.firstName} {intake.client.lastName}
                              </p>
                              {intake.coordinator && (
                                <p className="text-xs text-foreground-tertiary">
                                  {intake.coordinator.firstName} {intake.coordinator.lastName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Stage Progress */}
                        <td className="px-4 py-3">
                          <StageIndicator currentStage={currentStage} status={intake.status} />
                        </td>

                        {/* Current Stage */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{stageName}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge className={`${statusConfig.bgColor} ${statusConfig.color} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </Badge>
                        </td>

                        {/* Assessments */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <ClipboardCheck className="w-3.5 h-3.5 text-foreground-tertiary" />
                            <span className={`text-sm ${assessmentsDone === intake.assessments.length && intake.assessments.length > 0 ? "text-success font-medium" : ""}`}>
                              {assessmentsDone}/{intake.assessments.length}
                            </span>
                          </div>
                        </td>

                        {/* Consents */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-foreground-tertiary" />
                            <span className={`text-sm ${consentsDone === intake.consents.length && intake.consents.length > 0 ? "text-success font-medium" : ""}`}>
                              {consentsDone}/{intake.consents.length}
                            </span>
                          </div>
                        </td>

                        {/* Care Plan */}
                        <td className="px-4 py-3">
                          {intake.carePlan ? (
                            <Badge className="bg-success/10 text-success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Created
                            </Badge>
                          ) : (
                            <span className="text-sm text-foreground-tertiary">-</span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground-secondary">
                            {new Date(intake.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Arrow */}
                        <td className="px-4 py-3">
                          <ChevronRight className="w-4 h-4 text-foreground-tertiary group-hover:text-primary transition-colors" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-foreground-secondary">
        <span className="font-medium">Stages:</span>
        {STAGES.map((stage, index) => (
          <span key={stage.id} className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-background-secondary flex items-center justify-center text-[10px] font-medium">
              {index + 1}
            </span>
            {stage.name}
          </span>
        ))}
      </div>
    </div>
  );
}
