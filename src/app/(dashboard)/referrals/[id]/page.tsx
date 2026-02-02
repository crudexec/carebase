"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  Label,
  Textarea,
  Input,
  Breadcrumb,
} from "@/components/ui";
import {
  Loader2,
  Phone,
  MapPin,
  Calendar,
  Clock,
  UserPlus,
  Edit2,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

interface Referral {
  id: string;
  referralNumber: string;
  status: string;
  receivedDate: string;
  urgency?: string;
  reason?: string;
  prospectFirstName: string;
  prospectLastName: string;
  prospectDob?: string;
  prospectPhone?: string;
  prospectAddress?: string;
  prospectCity?: string;
  prospectState?: string;
  prospectZip?: string;
  primaryDiagnosis?: string;
  diagnosisCodes: string[];
  medicaidId?: string;
  insuranceInfo?: string;
  requestedServices: string[];
  hoursRequested?: number;
  specialNeeds?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  referralSourceOther?: string;
  lastContactDate?: string;
  lastContactMethod?: string;
  nextFollowUpDate?: string;
  followUpNotes?: string;
  convertedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  lostReason?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  referralSource?: {
    id: string;
    name: string;
    type: string;
    phone?: string;
    email?: string;
  };
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    status: string;
  };
  intake?: {
    id: string;
    intakeNumber: string;
    status: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-warning/20 text-warning border-warning/30",
  CONTACTED: "bg-primary/20 text-primary border-primary/30",
  QUALIFIED: "bg-success/20 text-success border-success/30",
  CONVERTED: "bg-success/20 text-success border-success/30",
  DECLINED: "bg-foreground-tertiary/20 text-foreground-tertiary border-foreground-tertiary/30",
  LOST: "bg-error/20 text-error border-error/30",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  DECLINED: "Declined",
  LOST: "Lost",
};

export default function ReferralDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [referral, setReferral] = React.useState<Referral | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Edit mode states
  const [editingStatus, setEditingStatus] = React.useState(false);
  const [editingFollowUp, setEditingFollowUp] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState("");
  const [followUpData, setFollowUpData] = React.useState({
    lastContactDate: "",
    lastContactMethod: "",
    nextFollowUpDate: "",
    followUpNotes: "",
  });

  React.useEffect(() => {
    fetchReferral();
  }, [params.id]);

  const fetchReferral = async () => {
    try {
      const response = await fetch(`/api/referrals/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setReferral(data.referral);
        setNewStatus(data.referral.status);
        setFollowUpData({
          lastContactDate: data.referral.lastContactDate?.split("T")[0] || "",
          lastContactMethod: data.referral.lastContactMethod || "",
          nextFollowUpDate: data.referral.nextFollowUpDate?.split("T")[0] || "",
          followUpNotes: data.referral.followUpNotes || "",
        });
      } else {
        setError(data.error || "Failed to fetch referral");
      }
    } catch (err) {
      setError("Failed to load referral");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!referral || newStatus === referral.status) {
      setEditingStatus(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/referrals/${referral.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setReferral(data.referral);
        setEditingStatus(false);
      } else {
        setError(data.error || "Failed to update status");
      }
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFollowUpUpdate = async () => {
    if (!referral) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/referrals/${referral.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(followUpData),
      });

      const data = await response.json();

      if (response.ok) {
        setReferral(data.referral);
        setEditingFollowUp(false);
      } else {
        setError(data.error || "Failed to update follow-up");
      }
    } catch (err) {
      setError("Failed to update follow-up");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConvert = async () => {
    if (!referral) return;

    if (!confirm("Convert this referral to a client and start intake?")) {
      return;
    }

    setIsConverting(true);
    try {
      const response = await fetch(`/api/referrals/${referral.id}/convert`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to intake page
        router.push(`/intake/${data.intake.id}`);
      } else {
        setError(data.error || "Failed to convert referral");
      }
    } catch (err) {
      setError("Failed to convert referral");
    } finally {
      setIsConverting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Referrals", href: "/referrals" },
            { label: "Loading..." },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Referrals", href: "/referrals" },
            { label: "Not Found" },
          ]}
        />
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Referral not found</h2>
          <p className="text-foreground-secondary mt-1">{error}</p>
          <Link href="/referrals" className="mt-4 inline-block">
            <Button variant="secondary">Back to Referrals</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canConvert = ["PENDING", "CONTACTED", "QUALIFIED"].includes(referral.status);
  const isOverdue =
    referral.nextFollowUpDate && new Date(referral.nextFollowUpDate) < new Date();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Referrals", href: "/referrals" },
          { label: `${referral.prospectFirstName} ${referral.prospectLastName}` },
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {referral.prospectFirstName} {referral.prospectLastName}
            </h1>
            {editingStatus ? (
              <div className="flex items-center gap-2">
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-36"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  className="p-1 text-success hover:bg-success/10 rounded"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingStatus(false);
                    setNewStatus(referral.status);
                  }}
                  className="p-1 text-error hover:bg-error/10 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge className={STATUS_COLORS[referral.status]}>
                  {STATUS_LABELS[referral.status]}
                </Badge>
                {referral.status !== "CONVERTED" && (
                  <button
                    onClick={() => setEditingStatus(true)}
                    className="p-1 text-foreground-tertiary hover:text-foreground"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
            {referral.urgency && referral.urgency !== "ROUTINE" && (
              <Badge variant="error">{referral.urgency}</Badge>
            )}
          </div>
          <p className="text-foreground-secondary text-sm">
            {referral.referralNumber} • Received{" "}
            {format(new Date(referral.receivedDate), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canConvert && (
            <Button onClick={handleConvert} disabled={isConverting}>
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convert to Client
                </>
              )}
            </Button>
          )}
          {referral.intake && (
            <Link href={`/intake/${referral.intake.id}`}>
              <Button variant="secondary">
                <ArrowRight className="mr-2 h-4 w-4" />
                View Intake
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-md bg-error/10 text-error text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {referral.prospectPhone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-tertiary">Phone</p>
                      <p className="font-medium">{referral.prospectPhone}</p>
                    </div>
                  </div>
                )}
                {referral.prospectDob && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-tertiary">Date of Birth</p>
                      <p className="font-medium">
                        {format(new Date(referral.prospectDob), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {referral.prospectAddress && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground-tertiary">Address</p>
                    <p className="font-medium">
                      {referral.prospectAddress}
                      <br />
                      {referral.prospectCity}, {referral.prospectState}{" "}
                      {referral.prospectZip}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {referral.primaryDiagnosis && (
                <div>
                  <p className="text-xs text-foreground-tertiary">Primary Diagnosis</p>
                  <p className="font-medium">{referral.primaryDiagnosis}</p>
                </div>
              )}
              {referral.medicaidId && (
                <div>
                  <p className="text-xs text-foreground-tertiary">Medicaid ID</p>
                  <p className="font-medium font-mono">{referral.medicaidId}</p>
                </div>
              )}
              {referral.insuranceInfo && (
                <div>
                  <p className="text-xs text-foreground-tertiary">Insurance</p>
                  <p className="font-medium">{referral.insuranceInfo}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Care Needs */}
          <Card>
            <CardHeader>
              <CardTitle>Care Needs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {referral.requestedServices.length > 0 && (
                <div>
                  <p className="text-xs text-foreground-tertiary mb-2">
                    Requested Services
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {referral.requestedServices.map((service) => (
                      <Badge key={service}>
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {referral.hoursRequested && (
                <div>
                  <p className="text-xs text-foreground-tertiary">Hours Requested</p>
                  <p className="font-medium">{referral.hoursRequested} hours/week</p>
                </div>
              )}
              {referral.specialNeeds && (
                <div>
                  <p className="text-xs text-foreground-tertiary">Special Needs</p>
                  <p className="font-medium">{referral.specialNeeds}</p>
                </div>
              )}
              {referral.reason && (
                <div>
                  <p className="text-xs text-foreground-tertiary">Reason for Referral</p>
                  <p className="font-medium">{referral.reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Follow-up Tracking */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Follow-up
              </CardTitle>
              {!editingFollowUp && referral.status !== "CONVERTED" && (
                <button
                  onClick={() => setEditingFollowUp(true)}
                  className="p-1 text-foreground-tertiary hover:text-foreground"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {editingFollowUp ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastContactDate">Last Contact</Label>
                    <Input
                      id="lastContactDate"
                      type="date"
                      value={followUpData.lastContactDate}
                      onChange={(e) =>
                        setFollowUpData((prev) => ({
                          ...prev,
                          lastContactDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastContactMethod">Contact Method</Label>
                    <Select
                      id="lastContactMethod"
                      value={followUpData.lastContactMethod}
                      onChange={(e) =>
                        setFollowUpData((prev) => ({
                          ...prev,
                          lastContactMethod: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select...</option>
                      <option value="PHONE">Phone</option>
                      <option value="EMAIL">Email</option>
                      <option value="IN_PERSON">In Person</option>
                      <option value="FAX">Fax</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextFollowUpDate">Next Follow-up</Label>
                    <Input
                      id="nextFollowUpDate"
                      type="date"
                      value={followUpData.nextFollowUpDate}
                      onChange={(e) =>
                        setFollowUpData((prev) => ({
                          ...prev,
                          nextFollowUpDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followUpNotes">Notes</Label>
                    <Textarea
                      id="followUpNotes"
                      value={followUpData.followUpNotes}
                      onChange={(e) =>
                        setFollowUpData((prev) => ({
                          ...prev,
                          followUpNotes: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleFollowUpUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingFollowUp(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {referral.lastContactDate && (
                    <div>
                      <p className="text-xs text-foreground-tertiary">Last Contact</p>
                      <p className="font-medium">
                        {format(new Date(referral.lastContactDate), "MMM d, yyyy")}
                        {referral.lastContactMethod &&
                          ` (${referral.lastContactMethod.toLowerCase()})`}
                      </p>
                    </div>
                  )}
                  {referral.nextFollowUpDate && (
                    <div
                      className={`p-3 rounded-lg ${
                        isOverdue
                          ? "bg-error/10 border border-error/20"
                          : "bg-background-secondary"
                      }`}
                    >
                      <p className="text-xs text-foreground-tertiary">Next Follow-up</p>
                      <p
                        className={`font-medium ${isOverdue ? "text-error" : ""}`}
                      >
                        {format(new Date(referral.nextFollowUpDate), "MMM d, yyyy")}
                        {isOverdue && " (Overdue)"}
                      </p>
                    </div>
                  )}
                  {referral.followUpNotes && (
                    <div>
                      <p className="text-xs text-foreground-tertiary">Notes</p>
                      <p className="text-sm">{referral.followUpNotes}</p>
                    </div>
                  )}
                  {!referral.lastContactDate && !referral.nextFollowUpDate && (
                    <p className="text-sm text-foreground-tertiary">
                      No follow-up information recorded
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Referral Source */}
          {(referral.referralSource || referral.referralSourceOther) && (
            <Card>
              <CardHeader>
                <CardTitle>Referral Source</CardTitle>
              </CardHeader>
              <CardContent>
                {referral.referralSource ? (
                  <div className="space-y-2">
                    <p className="font-medium">{referral.referralSource.name}</p>
                    <Badge>
                      {referral.referralSource.type}
                    </Badge>
                    {referral.referralSource.phone && (
                      <p className="text-sm text-foreground-secondary">
                        {referral.referralSource.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">{referral.referralSourceOther}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assigned To */}
          {referral.assignedTo && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned To</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {referral.assignedTo.firstName[0]}
                      {referral.assignedTo.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {referral.assignedTo.firstName} {referral.assignedTo.lastName}
                    </p>
                    <p className="text-sm text-foreground-secondary">
                      {referral.assignedTo.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact */}
          {referral.emergencyContact && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{referral.emergencyContact}</p>
                {referral.emergencyRelation && (
                  <p className="text-sm text-foreground-secondary">
                    {referral.emergencyRelation}
                  </p>
                )}
                {referral.emergencyPhone && (
                  <p className="text-sm">{referral.emergencyPhone}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
