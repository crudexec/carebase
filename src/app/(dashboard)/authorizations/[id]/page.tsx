"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Select,
  Label,
  Textarea,
  Badge,
  Breadcrumb,
} from "@/components/ui";
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Save,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  BarChart3,
  Phone,
} from "lucide-react";

interface Authorization {
  id: string;
  authNumber: string;
  serviceType: string;
  startDate: string;
  endDate: string;
  authorizedUnits: number;
  usedUnits: number;
  remainingUnits: number;
  usagePercentage: number;
  daysRemaining: number;
  unitType: string;
  status: string;
  notes: string | null;
  diagnosisCodes: string[];
  isExpiringSoon: boolean;
  isExpired: boolean;
  isNearingLimit: boolean;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    medicaidId: string | null;
    phone: string | null;
  };
  alerts: Array<{
    id: string;
    alertType: string;
    message: string;
    priority: string;
    isResolved: boolean;
    createdAt: string;
  }>;
}

const SERVICE_CODES = [
  { value: "T1019", label: "T1019 - Personal Care Services (15 min)" },
  { value: "T1020", label: "T1020 - Personal Care Services (per diem)" },
  { value: "S5125", label: "S5125 - Attendant Care (15 min)" },
  { value: "S5130", label: "S5130 - Homemaker Services (15 min)" },
  { value: "S5135", label: "S5135 - Companion Services (15 min)" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: { label: "Pending", color: "bg-warning/10 text-warning", icon: Clock },
  ACTIVE: { label: "Active", color: "bg-success/10 text-success", icon: CheckCircle },
  EXHAUSTED: { label: "Exhausted", color: "bg-error/10 text-error", icon: XCircle },
  EXPIRED: { label: "Expired", color: "bg-foreground/10 text-foreground-secondary", icon: XCircle },
  TERMINATED: { label: "Terminated", color: "bg-foreground/10 text-foreground-secondary", icon: XCircle },
  CANCELLED: { label: "Cancelled", color: "bg-foreground/10 text-foreground-secondary", icon: XCircle },
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-error text-white",
  HIGH: "bg-warning text-white",
  MEDIUM: "bg-info/80 text-white",
  LOW: "bg-foreground/20 text-foreground",
};

export default function AuthorizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [authorization, setAuthorization] = React.useState<Authorization | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    authorizationNumber: "",
    serviceCode: "",
    startDate: "",
    endDate: "",
    unitsAuthorized: 0,
    unitsUsed: 0,
    status: "ACTIVE",
    notes: "",
  });

  const fetchAuthorization = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/authorizations/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch authorization");
      }

      setAuthorization(data.authorization);
      setFormData({
        authorizationNumber: data.authorization.authNumber || "",
        serviceCode: data.authorization.serviceType || "",
        startDate: data.authorization.startDate?.split("T")[0] || "",
        endDate: data.authorization.endDate?.split("T")[0] || "",
        unitsAuthorized: data.authorization.authorizedUnits || 0,
        unitsUsed: data.authorization.usedUnits || 0,
        status: data.authorization.status || "ACTIVE",
        notes: data.authorization.notes || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch authorization");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchAuthorization();
  }, [fetchAuthorization]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "unitsAuthorized" || name === "unitsUsed" ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/authorizations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update authorization");
      }

      await fetchAuthorization();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update authorization");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to terminate this authorization?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/authorizations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to terminate authorization");
      }

      router.push("/authorizations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to terminate authorization");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !authorization) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Authorizations", href: "/authorizations" },
            { label: "Not Found" },
          ]}
        />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ShieldCheck className="mx-auto h-12 w-12 text-foreground-secondary/50" />
              <h3 className="mt-4 text-lg font-medium">Authorization not found</h3>
              <p className="mt-2 text-sm text-foreground-secondary">{error}</p>
              <Link href="/authorizations">
                <Button className="mt-4">Back to Authorizations</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!authorization) return null;

  const statusConfig = STATUS_CONFIG[authorization.status] || STATUS_CONFIG.ACTIVE;
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Authorizations", href: "/authorizations" },
          { label: `${authorization.client.firstName} ${authorization.client.lastName}`, href: `/clients/${authorization.client.id}` },
          { label: `#${authorization.authNumber}` },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              Authorization #{authorization.authNumber}
            </h1>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          </div>
          <p className="text-foreground-secondary">
            {authorization.client.firstName} {authorization.client.lastName}
              {authorization.client.medicaidId && ` • ${authorization.client.medicaidId}`}
            </p>
          </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="error"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Terminate
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-md bg-error/10 text-error text-sm">{error}</div>
      )}

      {/* Alert Banner */}
      {(authorization.isExpiringSoon || authorization.isNearingLimit || authorization.isExpired) && (
        <Card
          className={`border ${
            authorization.isExpired || authorization.status === "EXHAUSTED"
              ? "border-error bg-error/5"
              : "border-warning bg-warning/5"
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle
                className={`h-6 w-6 ${
                  authorization.isExpired || authorization.status === "EXHAUSTED"
                    ? "text-error"
                    : "text-warning"
                }`}
              />
              <div>
                <p className="font-medium">
                  {authorization.isExpired
                    ? "This authorization has expired"
                    : authorization.status === "EXHAUSTED"
                    ? "Units exhausted - no units remaining"
                    : authorization.isExpiringSoon && authorization.isNearingLimit
                    ? `Expiring in ${authorization.daysRemaining} days and ${authorization.usagePercentage.toFixed(0)}% units used`
                    : authorization.isExpiringSoon
                    ? `Expiring in ${authorization.daysRemaining} days`
                    : `${authorization.usagePercentage.toFixed(0)}% of units used`}
                </p>
                <p className="text-sm text-foreground-secondary">
                  {authorization.remainingUnits} {authorization.unitType.toLowerCase()} remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Usage Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-foreground-secondary">
                      {authorization.usedUnits} / {authorization.authorizedUnits}{" "}
                      {authorization.unitType.toLowerCase()} used
                    </span>
                    <span
                      className={`font-medium ${
                        authorization.usagePercentage >= 90
                          ? "text-error"
                          : authorization.usagePercentage >= 80
                          ? "text-warning"
                          : "text-foreground"
                      }`}
                    >
                      {authorization.usagePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-4 bg-background-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        authorization.usagePercentage >= 90
                          ? "bg-error"
                          : authorization.usagePercentage >= 80
                          ? "bg-warning"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(authorization.usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 rounded-lg bg-background-secondary">
                    <p className="text-2xl font-bold text-primary">
                      {authorization.authorizedUnits}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      {authorization.unitType === "QUARTER_HOURLY"
                        ? "15-Min Units Authorized"
                        : authorization.unitType === "DAILY"
                        ? "Days Authorized"
                        : "Hours Authorized"}
                    </p>
                    <p className="text-[10px] text-foreground-tertiary mt-1">
                      Total approved by Medicaid
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background-secondary">
                    <p className="text-2xl font-bold text-warning">
                      {authorization.usedUnits}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      {authorization.unitType === "QUARTER_HOURLY"
                        ? "15-Min Units Used"
                        : authorization.unitType === "DAILY"
                        ? "Days Used"
                        : "Hours Used"}
                    </p>
                    <p className="text-[10px] text-foreground-tertiary mt-1">
                      Consumed from shifts
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background-secondary">
                    <p className="text-2xl font-bold text-success">
                      {authorization.remainingUnits}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      {authorization.unitType === "QUARTER_HOURLY"
                        ? "15-Min Units Left"
                        : authorization.unitType === "DAILY"
                        ? "Days Left"
                        : "Hours Left"}
                    </p>
                    <p className="text-[10px] text-foreground-tertiary mt-1">
                      Available for scheduling
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authorization Details */}
          <Card>
            <CardHeader>
              <CardTitle>Authorization Details</CardTitle>
              <CardDescription>
                Medicaid authorization information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="authorizationNumber">Authorization Number</Label>
                      <Input
                        id="authorizationNumber"
                        name="authorizationNumber"
                        value={formData.authorizationNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceCode">Service Code</Label>
                      <Select
                        id="serviceCode"
                        name="serviceCode"
                        value={formData.serviceCode}
                        onChange={handleChange}
                      >
                        {SERVICE_CODES.map((code) => (
                          <option key={code.value} value={code.value}>
                            {code.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="unitsAuthorized">Units Authorized</Label>
                      <Input
                        id="unitsAuthorized"
                        name="unitsAuthorized"
                        type="number"
                        min="0"
                        value={formData.unitsAuthorized}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitsUsed">Units Used</Label>
                      <Input
                        id="unitsUsed"
                        name="unitsUsed"
                        type="number"
                        min="0"
                        value={formData.unitsUsed}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACTIVE">Active</option>
                      <option value="EXHAUSTED">Exhausted</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="TERMINATED">Terminated</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-foreground-secondary">Authorization Number</p>
                      <p className="font-medium">{authorization.authNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-secondary">Service Code</p>
                      <p className="font-medium">{authorization.serviceType}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-foreground-secondary">Start Date</p>
                      <p className="font-medium">
                        {new Date(authorization.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-secondary">End Date</p>
                      <p className="font-medium">
                        {new Date(authorization.endDate).toLocaleDateString()}
                        {authorization.daysRemaining > 0 && (
                          <span className="text-foreground-secondary text-sm ml-2">
                            ({authorization.daysRemaining} days left)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-foreground-secondary">Unit Type</p>
                      <p className="font-medium capitalize">
                        {authorization.unitType.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-secondary">Status</p>
                      <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                    </div>
                  </div>

                  {authorization.diagnosisCodes && authorization.diagnosisCodes.length > 0 && (
                    <div>
                      <p className="text-sm text-foreground-secondary">Diagnosis Codes</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {authorization.diagnosisCodes.map((code, index) => (
                          <Badge key={index} variant="default">
                            {code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {authorization.notes && (
                    <div>
                      <p className="text-sm text-foreground-secondary">Notes</p>
                      <p className="text-sm">{authorization.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          {authorization.alerts && authorization.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {authorization.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.isResolved ? "bg-background-secondary" : "bg-warning/5 border-warning/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={PRIORITY_COLORS[alert.priority] || "bg-foreground/20"}>
                              {alert.priority}
                            </Badge>
                            <span className="text-sm font-medium">
                              {alert.alertType.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-foreground-secondary mt-1">
                            {alert.message}
                          </p>
                        </div>
                        <span className="text-xs text-foreground-tertiary whitespace-nowrap">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-foreground-secondary">Name</p>
                <Link
                  href={`/clients/${authorization.client.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {authorization.client.firstName} {authorization.client.lastName}
                </Link>
              </div>
              {authorization.client.medicaidId && (
                <div>
                  <p className="text-sm text-foreground-secondary">Medicaid ID</p>
                  <p className="font-medium">{authorization.client.medicaidId}</p>
                </div>
              )}
              {authorization.client.phone && (
                <div>
                  <p className="text-sm text-foreground-secondary">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {authorization.client.phone}
                  </p>
                </div>
              )}
              <Link href={`/clients/${authorization.client.id}`}>
                <Button variant="secondary" className="w-full mt-2">
                  View Client Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-foreground-secondary">Authorization Period</p>
                <p className="font-medium">
                  {new Date(authorization.startDate).toLocaleDateString()} -{" "}
                  {new Date(authorization.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary">Days Remaining</p>
                <p
                  className={`font-medium ${
                    authorization.daysRemaining <= 7
                      ? "text-error"
                      : authorization.daysRemaining <= 30
                      ? "text-warning"
                      : ""
                  }`}
                >
                  {authorization.daysRemaining > 0
                    ? `${authorization.daysRemaining} days`
                    : "Expired"}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary">Created</p>
                <p className="text-sm">
                  {new Date(authorization.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary">Last Updated</p>
                <p className="text-sm">
                  {new Date(authorization.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
