"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ClientStatus } from "@prisma/client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import {
  ArrowLeft,
  User,
  Phone,
  CreditCard,
  HeartPulse,
  Stethoscope,
  FileText,
  Save,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CarerOption {
  id: string;
  firstName: string;
  lastName: string;
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  PROSPECT: "Prospect",
  ONBOARDING: "Onboarding",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

const REFERRAL_SOURCES = [
  "Hospital",
  "Physician Referral",
  "Self-Referral",
  "Family/Friend",
  "Insurance Company",
  "Social Worker",
  "Discharge Planner",
  "Home Health Agency",
  "Skilled Nursing Facility",
  "Other",
];

interface FormSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  isComplete: boolean;
}

export default function AddClientPage() {
  const router = useRouter();
  const [carers, setCarers] = React.useState<CarerOption[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(["personal", "contact", "insurance", "pcp", "referral"])
  );

  // Form state
  const [formData, setFormData] = React.useState({
    // Personal Information
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    // Contact Information
    address: "",
    phone: "",
    // Care Assignment
    status: "PROSPECT" as ClientStatus,
    assignedCarerId: "",
    // Insurance Information
    medicaidId: "",
    medicaidPayerId: "",
    secondaryInsuranceId: "",
    secondaryPayerId: "",
    // Medical Information
    medicalNotes: "",
    // PCP Information
    physicianName: "",
    physicianNpi: "",
    physicianPhone: "",
    physicianFax: "",
    physicianAddress: "",
    // Referral Information
    referralSource: "",
    referralDate: "",
    referringPhysicianName: "",
    referringPhysicianNpi: "",
    referringPhysicianPhone: "",
    referringPhysicianFax: "",
    referralNotes: "",
  });

  // Fetch carers for assignment dropdown
  React.useEffect(() => {
    const fetchCarers = async () => {
      try {
        const response = await fetch("/api/staff?role=CARER&limit=100");
        if (response.ok) {
          const data = await response.json();
          setCarers(data.staff);
        }
      } catch {
        // Ignore errors
      }
    };
    fetchCarers();
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth || null,
          address: formData.address || null,
          phone: formData.phone || null,
          medicalNotes: formData.medicalNotes || null,
          assignedCarerId: formData.assignedCarerId || null,
          medicaidId: formData.medicaidId || null,
          medicaidPayerId: formData.medicaidPayerId || null,
          secondaryInsuranceId: formData.secondaryInsuranceId || null,
          secondaryPayerId: formData.secondaryPayerId || null,
          physicianName: formData.physicianName || null,
          physicianNpi: formData.physicianNpi || null,
          physicianPhone: formData.physicianPhone || null,
          physicianFax: formData.physicianFax || null,
          physicianAddress: formData.physicianAddress || null,
          referralSource: formData.referralSource || null,
          referralDate: formData.referralDate || null,
          referringPhysicianName: formData.referringPhysicianName || null,
          referringPhysicianNpi: formData.referringPhysicianNpi || null,
          referringPhysicianPhone: formData.referringPhysicianPhone || null,
          referringPhysicianFax: formData.referringPhysicianFax || null,
          referralNotes: formData.referralNotes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add client");
      }

      const data = await response.json();
      router.push(`/clients/${data.client.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add client");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check section completion
  const sections: FormSection[] = [
    {
      id: "personal",
      title: "Personal Information",
      icon: <User className="w-5 h-5" />,
      isComplete: !!(formData.firstName && formData.lastName),
    },
    {
      id: "contact",
      title: "Contact Information",
      icon: <Phone className="w-5 h-5" />,
      isComplete: !!(formData.phone || formData.address),
    },
    {
      id: "insurance",
      title: "Insurance Details",
      icon: <CreditCard className="w-5 h-5" />,
      isComplete: !!formData.medicaidId,
    },
    {
      id: "pcp",
      title: "Primary Care Physician",
      icon: <Stethoscope className="w-5 h-5" />,
      isComplete: !!formData.physicianName,
    },
    {
      id: "referral",
      title: "Referral Information",
      icon: <FileText className="w-5 h-5" />,
      isComplete: !!formData.referralSource,
    },
  ];

  const completedSections = sections.filter((s) => s.isComplete).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/clients")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Clients
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Add New Client</h1>
                <p className="text-sm text-foreground-secondary">
                  Enter client details to create a new record
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-foreground-secondary">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>{completedSections}/{sections.length} sections</span>
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.firstName || !formData.lastName}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Client"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-error">Error creating client</p>
              <p className="text-sm text-error/80 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-error/60 hover:text-error"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Progress Sidebar + Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Progress Sidebar - Desktop */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-2">
                <p className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider mb-3">
                  Form Progress
                </p>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      if (!expandedSections.has(section.id)) {
                        toggleSection(section.id);
                      }
                      document.getElementById(`section-${section.id}`)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      expandedSections.has(section.id)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-background-secondary text-foreground-secondary"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 ${
                        section.isComplete ? "text-success" : ""
                      }`}
                    >
                      {section.isComplete ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        section.icon
                      )}
                    </div>
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Sections */}
            <div className="lg:col-span-3 space-y-6">
              {/* Personal Information */}
              <Card id="section-personal" className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("personal")}
                  className="w-full"
                >
                  <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-background-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${sections[0].isComplete ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                        {sections[0].isComplete ? <CheckCircle2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">Personal Information</CardTitle>
                        <p className="text-sm text-foreground-secondary font-normal mt-0.5">
                          Basic client details and identification
                        </p>
                      </div>
                    </div>
                    {expandedSections.has("personal") ? (
                      <ChevronDown className="w-5 h-5 text-foreground-tertiary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-foreground-tertiary" />
                    )}
                  </CardHeader>
                </button>
                {expandedSections.has("personal") && (
                  <CardContent className="pt-0 pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" required>First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                          }
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" required>Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                          }
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          id="status"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              status: e.target.value as ClientStatus,
                            }))
                          }
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Contact Information */}
              <Card id="section-contact" className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("contact")}
                  className="w-full"
                >
                  <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-background-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${sections[1].isComplete ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                        {sections[1].isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">Contact Information</CardTitle>
                        <p className="text-sm text-foreground-secondary font-normal mt-0.5">
                          Phone number and address details
                        </p>
                      </div>
                    </div>
                    {expandedSections.has("contact") ? (
                      <ChevronDown className="w-5 h-5 text-foreground-tertiary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-foreground-tertiary" />
                    )}
                  </CardHeader>
                </button>
                {expandedSections.has("contact") && (
                  <CardContent className="pt-0 pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, address: e.target.value }))
                          }
                          placeholder="123 Main St, City, State 12345"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="assignedCarerId">Assigned Caregiver</Label>
                        <Select
                          id="assignedCarerId"
                          value={formData.assignedCarerId}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              assignedCarerId: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select a caregiver (optional)</option>
                          {carers.map((carer) => (
                            <option key={carer.id} value={carer.id}>
                              {carer.firstName} {carer.lastName}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Insurance Information */}
              <Card id="section-insurance" className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("insurance")}
                  className="w-full"
                >
                  <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-background-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${sections[2].isComplete ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                        {sections[2].isComplete ? <CheckCircle2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">Insurance Details</CardTitle>
                        <p className="text-sm text-foreground-secondary font-normal mt-0.5">
                          Medicaid and secondary insurance information
                        </p>
                      </div>
                    </div>
                    {expandedSections.has("insurance") ? (
                      <ChevronDown className="w-5 h-5 text-foreground-tertiary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-foreground-tertiary" />
                    )}
                  </CardHeader>
                </button>
                {expandedSections.has("insurance") && (
                  <CardContent className="pt-0 pb-6">
                    <div className="space-y-6">
                      {/* Primary Insurance */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Primary Insurance (Medicaid)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="medicaidId">Medicaid Member ID</Label>
                            <Input
                              id="medicaidId"
                              value={formData.medicaidId}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, medicaidId: e.target.value }))
                              }
                              placeholder="Enter member ID"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="medicaidPayerId">Medicaid Payer ID</Label>
                            <Input
                              id="medicaidPayerId"
                              value={formData.medicaidPayerId}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, medicaidPayerId: e.target.value }))
                              }
                              placeholder="Enter payer ID"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Secondary Insurance */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground-tertiary" />
                          Secondary Insurance
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="secondaryInsuranceId">Secondary Member ID</Label>
                            <Input
                              id="secondaryInsuranceId"
                              value={formData.secondaryInsuranceId}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, secondaryInsuranceId: e.target.value }))
                              }
                              placeholder="Enter member ID"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryPayerId">Secondary Payer ID</Label>
                            <Input
                              id="secondaryPayerId"
                              value={formData.secondaryPayerId}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, secondaryPayerId: e.target.value }))
                              }
                              placeholder="Enter payer ID"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* PCP Information */}
              <Card id="section-pcp" className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("pcp")}
                  className="w-full"
                >
                  <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-background-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${sections[3].isComplete ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                        {sections[3].isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">Primary Care Physician</CardTitle>
                        <p className="text-sm text-foreground-secondary font-normal mt-0.5">
                          PCP contact and practice information
                        </p>
                      </div>
                    </div>
                    {expandedSections.has("pcp") ? (
                      <ChevronDown className="w-5 h-5 text-foreground-tertiary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-foreground-tertiary" />
                    )}
                  </CardHeader>
                </button>
                {expandedSections.has("pcp") && (
                  <CardContent className="pt-0 pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="physicianName">Physician Name</Label>
                        <Input
                          id="physicianName"
                          value={formData.physicianName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, physicianName: e.target.value }))
                          }
                          placeholder="Dr. John Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="physicianNpi">NPI Number</Label>
                        <Input
                          id="physicianNpi"
                          value={formData.physicianNpi}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, physicianNpi: e.target.value }))
                          }
                          placeholder="10-digit NPI"
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="physicianPhone">Phone Number</Label>
                        <Input
                          id="physicianPhone"
                          type="tel"
                          value={formData.physicianPhone}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, physicianPhone: e.target.value }))
                          }
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="physicianFax">Fax Number</Label>
                        <Input
                          id="physicianFax"
                          type="tel"
                          value={formData.physicianFax}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, physicianFax: e.target.value }))
                          }
                          placeholder="(555) 123-4568"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="physicianAddress">Office Address</Label>
                        <Input
                          id="physicianAddress"
                          value={formData.physicianAddress}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, physicianAddress: e.target.value }))
                          }
                          placeholder="123 Medical Center Dr, City, State 12345"
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Referral Information */}
              <Card id="section-referral" className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("referral")}
                  className="w-full"
                >
                  <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-background-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${sections[4].isComplete ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                        {sections[4].isComplete ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">Referral Information</CardTitle>
                        <p className="text-sm text-foreground-secondary font-normal mt-0.5">
                          Referral source and referring physician details
                        </p>
                      </div>
                    </div>
                    {expandedSections.has("referral") ? (
                      <ChevronDown className="w-5 h-5 text-foreground-tertiary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-foreground-tertiary" />
                    )}
                  </CardHeader>
                </button>
                {expandedSections.has("referral") && (
                  <CardContent className="pt-0 pb-6">
                    <div className="space-y-6">
                      {/* Referral Source */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Referral Source
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="referralSource">Source</Label>
                            <Select
                              id="referralSource"
                              value={formData.referralSource}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, referralSource: e.target.value }))
                              }
                            >
                              <option value="">Select referral source</option>
                              {REFERRAL_SOURCES.map((source) => (
                                <option key={source} value={source}>
                                  {source}
                                </option>
                              ))}
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="referralDate">Referral Date</Label>
                            <Input
                              id="referralDate"
                              type="date"
                              value={formData.referralDate}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, referralDate: e.target.value }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                      {/* Referring Physician */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground-tertiary" />
                          Referring Physician (if applicable)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="referringPhysicianName">Physician Name</Label>
                            <Input
                              id="referringPhysicianName"
                              value={formData.referringPhysicianName}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, referringPhysicianName: e.target.value }))
                              }
                              placeholder="Dr. Jane Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="referringPhysicianNpi">NPI Number</Label>
                            <Input
                              id="referringPhysicianNpi"
                              value={formData.referringPhysicianNpi}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, referringPhysicianNpi: e.target.value }))
                              }
                              placeholder="10-digit NPI"
                              maxLength={10}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="referringPhysicianPhone">Phone Number</Label>
                            <Input
                              id="referringPhysicianPhone"
                              type="tel"
                              value={formData.referringPhysicianPhone}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, referringPhysicianPhone: e.target.value }))
                              }
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="referringPhysicianFax">Fax Number</Label>
                            <Input
                              id="referringPhysicianFax"
                              type="tel"
                              value={formData.referringPhysicianFax}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, referringPhysicianFax: e.target.value }))
                              }
                              placeholder="(555) 123-4568"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Referral Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="referralNotes">Referral Notes</Label>
                        <Textarea
                          id="referralNotes"
                          value={formData.referralNotes}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, referralNotes: e.target.value }))
                          }
                          rows={3}
                          placeholder="Additional notes about the referral..."
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Medical Notes */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Medical Notes</CardTitle>
                      <p className="text-sm text-foreground-secondary font-normal mt-0.5">
                        Additional medical information and care requirements
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                  <Textarea
                    id="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, medicalNotes: e.target.value }))
                    }
                    rows={4}
                    placeholder="Enter medical conditions, medications, allergies, or special care requirements..."
                  />
                </CardContent>
              </Card>

              {/* Submit Button - Mobile */}
              <div className="lg:hidden">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.firstName || !formData.lastName}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Saving..." : "Save Client"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
