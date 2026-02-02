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
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
} from "lucide-react";

interface Assessment {
  id: string;
  status: string;
  assessmentType: string;
  startedAt: string;
  completedAt: string | null;
  totalScore: number | null;
  interpretation: string | null;
  template: {
    id: string;
    name: string;
    description: string | null;
    maxScore: number | null;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assessor: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  IN_PROGRESS: { label: "In Progress", color: "bg-warning/10 text-warning", icon: Clock },
  COMPLETED: { label: "Completed", color: "bg-success/10 text-success", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-error/10 text-error", icon: XCircle },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  INITIAL: { label: "Initial", color: "bg-primary/10 text-primary" },
  REASSESSMENT: { label: "Reassessment", color: "bg-secondary/10 text-secondary" },
  DISCHARGE: { label: "Discharge", color: "bg-foreground/10 text-foreground" },
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  React.useEffect(() => {
    fetchAssessments();
  }, [statusFilter]);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "50");

      const response = await fetch(`/api/assessments?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAssessments(data.assessments || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      assessment.client.firstName.toLowerCase().includes(searchLower) ||
      assessment.client.lastName.toLowerCase().includes(searchLower) ||
      assessment.template.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Assessments" }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assessments</h1>
          <p className="text-foreground-secondary">
            Clinical assessments and evaluations
          </p>
        </div>
        <Link href="/assessments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {assessments.filter((a) => a.status === "IN_PROGRESS").length}
                </p>
                <p className="text-sm text-foreground-secondary">In Progress</p>
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
                  {assessments.filter((a) => a.status === "COMPLETED").length}
                </p>
                <p className="text-sm text-foreground-secondary">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-sm text-foreground-secondary">Total Assessments</p>
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
                  placeholder="Search by client or template..."
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
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessment List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto h-12 w-12 text-foreground-secondary/50" />
              <h3 className="mt-4 text-lg font-medium">No assessments found</h3>
              <p className="mt-2 text-sm text-foreground-secondary">
                {search || statusFilter
                  ? "Try adjusting your filters"
                  : "Get started by creating a new assessment"}
              </p>
              {!search && !statusFilter && (
                <Link href="/assessments/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    New Assessment
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssessments.map((assessment) => {
                const statusConfig = STATUS_CONFIG[assessment.status] || STATUS_CONFIG.IN_PROGRESS;
                const typeConfig = TYPE_CONFIG[assessment.assessmentType] || TYPE_CONFIG.INITIAL;
                const StatusIcon = statusConfig.icon;

                return (
                  <Link
                    key={assessment.id}
                    href={`/assessments/${assessment.id}`}
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
                              {assessment.template.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-foreground-secondary">
                              <User className="h-4 w-4" />
                              <span>
                                {assessment.client.firstName} {assessment.client.lastName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                            <Badge className={typeConfig.color}>
                              {typeConfig.label}
                            </Badge>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          {assessment.status === "COMPLETED" && assessment.totalScore !== null && (
                            <span className="text-sm font-medium">
                              Score: {assessment.totalScore}
                              {assessment.template.maxScore && ` / ${assessment.template.maxScore}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-foreground-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Started: {new Date(assessment.startedAt).toLocaleDateString()}
                        </span>
                        {assessment.completedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed: {new Date(assessment.completedAt).toLocaleDateString()}
                          </span>
                        )}
                        <span>
                          Assessor: {assessment.assessor.firstName} {assessment.assessor.lastName}
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
