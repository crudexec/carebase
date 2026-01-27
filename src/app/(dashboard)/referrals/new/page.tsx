"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  Label,
  Textarea,
} from "@/components/ui";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";

interface ReferralSource {
  id: string;
  name: string;
  type: string;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
}

const REFERRAL_SOURCE_TYPES = [
  { value: "PHYSICIAN", label: "Physician" },
  { value: "HOSPITAL", label: "Hospital" },
  { value: "SKILLED_NURSING", label: "Skilled Nursing Facility" },
  { value: "FAMILY", label: "Family" },
  { value: "SELF", label: "Self" },
  { value: "CASE_MANAGER", label: "Case Manager" },
  { value: "SOCIAL_WORKER", label: "Social Worker" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "MARKETING", label: "Marketing" },
  { value: "OTHER", label: "Other" },
];

const US_STATES = [
  { value: "MD", label: "Maryland" },
  { value: "DC", label: "District of Columbia" },
  { value: "VA", label: "Virginia" },
  { value: "PA", label: "Pennsylvania" },
  { value: "DE", label: "Delaware" },
  { value: "WV", label: "West Virginia" },
];

export default function NewReferralPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sources, setSources] = React.useState<ReferralSource[]>([]);
  const [staff, setStaff] = React.useState<StaffMember[]>([]);

  const [formData, setFormData] = React.useState({
    // Prospect info
    prospectFirstName: "",
    prospectLastName: "",
    prospectDob: "",
    prospectPhone: "",
    prospectAddress: "",
    prospectCity: "",
    prospectState: "MD",
    prospectZip: "",
    // Clinical info
    primaryDiagnosis: "",
    medicaidId: "",
    insuranceInfo: "",
    // Care needs
    requestedServices: [] as string[],
    hoursRequested: "",
    specialNeeds: "",
    // Emergency contact
    emergencyContact: "",
    emergencyPhone: "",
    emergencyRelation: "",
    // Referral source
    referralSourceId: "",
    referralSourceOther: "",
    // Assignment
    urgency: "ROUTINE",
    reason: "",
    assignedToId: "",
  });

  React.useEffect(() => {
    fetchSources();
    fetchStaff();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch("/api/referrals/sources");
      const data = await response.json();
      if (response.ok) {
        setSources(data.sources || []);
      }
    } catch (error) {
      console.error("Failed to fetch sources:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/staff?roles=ADMIN,OPS_MANAGER,CLINICAL_DIRECTOR,STAFF");
      const data = await response.json();
      if (response.ok) {
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServicesChange = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      requestedServices: prev.requestedServices.includes(service)
        ? prev.requestedServices.filter((s) => s !== service)
        : [...prev.requestedServices, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        hoursRequested: formData.hoursRequested
          ? parseFloat(formData.hoursRequested)
          : undefined,
        prospectDob: formData.prospectDob || undefined,
      };

      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create referral");
      }

      router.push(`/referrals/${data.referral.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create referral");
      setIsSubmitting(false);
    }
  };

  const serviceOptions = [
    "Personal Care",
    "Bathing Assistance",
    "Dressing Assistance",
    "Toileting Assistance",
    "Meal Preparation",
    "Medication Reminders",
    "Light Housekeeping",
    "Companionship",
    "Transportation",
    "Respite Care",
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/referrals">
          <button
            type="button"
            className="rounded p-1 hover:bg-background-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Referral</h1>
          <p className="text-foreground-secondary">
            Enter prospect information from the referral
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error */}
        {error && (
          <div className="p-4 rounded-md bg-error/10 text-error text-sm">
            {error}
          </div>
        )}

        {/* Prospect Information */}
        <Card>
          <CardHeader>
            <CardTitle>Prospect Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prospectFirstName" required>
                  First Name
                </Label>
                <Input
                  id="prospectFirstName"
                  name="prospectFirstName"
                  value={formData.prospectFirstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospectLastName" required>
                  Last Name
                </Label>
                <Input
                  id="prospectLastName"
                  name="prospectLastName"
                  value={formData.prospectLastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prospectDob">Date of Birth</Label>
                <Input
                  id="prospectDob"
                  name="prospectDob"
                  type="date"
                  value={formData.prospectDob}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospectPhone">Phone</Label>
                <Input
                  id="prospectPhone"
                  name="prospectPhone"
                  type="tel"
                  value={formData.prospectPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prospectAddress">Address</Label>
              <Input
                id="prospectAddress"
                name="prospectAddress"
                value={formData.prospectAddress}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="prospectCity">City</Label>
                <Input
                  id="prospectCity"
                  name="prospectCity"
                  value={formData.prospectCity}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospectState">State</Label>
                <Select
                  id="prospectState"
                  name="prospectState"
                  value={formData.prospectState}
                  onChange={handleChange}
                >
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospectZip">ZIP Code</Label>
                <Input
                  id="prospectZip"
                  name="prospectZip"
                  value={formData.prospectZip}
                  onChange={handleChange}
                  placeholder="12345"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryDiagnosis">Primary Diagnosis</Label>
                <Input
                  id="primaryDiagnosis"
                  name="primaryDiagnosis"
                  value={formData.primaryDiagnosis}
                  onChange={handleChange}
                  placeholder="ICD-10 code or description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicaidId">Medicaid ID</Label>
                <Input
                  id="medicaidId"
                  name="medicaidId"
                  value={formData.medicaidId}
                  onChange={handleChange}
                  placeholder="If applicable"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="insuranceInfo">Insurance Information</Label>
              <Textarea
                id="insuranceInfo"
                name="insuranceInfo"
                value={formData.insuranceInfo}
                onChange={handleChange}
                rows={2}
                placeholder="Insurance carrier, plan type, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Care Needs */}
        <Card>
          <CardHeader>
            <CardTitle>Care Needs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Requested Services</Label>
              <div className="flex flex-wrap gap-2">
                {serviceOptions.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleServicesChange(service)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      formData.requestedServices.includes(service)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hoursRequested">Hours Requested (per week)</Label>
                <Input
                  id="hoursRequested"
                  name="hoursRequested"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.hoursRequested}
                  onChange={handleChange}
                  placeholder="e.g., 20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">STAT (Immediate)</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialNeeds">Special Needs / Notes</Label>
              <Textarea
                id="specialNeeds"
                name="specialNeeds"
                value={formData.specialNeeds}
                onChange={handleChange}
                rows={3}
                placeholder="Any special requirements, preferences, or notes..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Contact Name</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  name="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyRelation">Relationship</Label>
                <Input
                  id="emergencyRelation"
                  name="emergencyRelation"
                  value={formData.emergencyRelation}
                  onChange={handleChange}
                  placeholder="e.g., Daughter, Spouse"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Source & Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Source & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="referralSourceId">Referral Source</Label>
                <Select
                  id="referralSourceId"
                  name="referralSourceId"
                  value={formData.referralSourceId}
                  onChange={handleChange}
                >
                  <option value="">Select source...</option>
                  {sources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name} ({source.type})
                    </option>
                  ))}
                  <option value="OTHER">Other (specify below)</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedToId">Assign To</Label>
                <Select
                  id="assignedToId"
                  name="assignedToId"
                  value={formData.assignedToId}
                  onChange={handleChange}
                >
                  <option value="">Select staff member...</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {formData.referralSourceId === "OTHER" && (
              <div className="space-y-2">
                <Label htmlFor="referralSourceOther">Other Source</Label>
                <Input
                  id="referralSourceOther"
                  name="referralSourceOther"
                  value={formData.referralSourceOther}
                  onChange={handleChange}
                  placeholder="Describe the referral source"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Referral</Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={2}
                placeholder="Why is this client being referred for home care?"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/referrals">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Referral
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
