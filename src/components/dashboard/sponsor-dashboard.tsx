"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  FileText,
  Eye,
  MessageCircle,
  Calendar,
  User,
  Phone,
  MapPin,
  Activity,
  DollarSign,
  RefreshCw,
  ChevronRight,
  ClipboardList,
  Users,
} from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  address: string | null;
  phone: string | null;
  status: string;
  assignedCarer: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface CareReport {
  id: string;
  source: "visit-note" | "daily-report";
  title: string;
  statusLabel: string;
  date: string;
  submittedAt: string;
  href: string | null;
  summary: string | null;
  shift: {
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
  } | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  carer: {
    firstName: string;
    lastName: string;
  };
  details?: {
    activities: string | null;
    medications: string | null;
    concerns: string | null;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  currency: "USD" | "GBP" | "CAD" | "NGN";
  total: number;
  amountPaid: number;
  amountDue: number;
  status: string;
  dueDate: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  sponsor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface SponsorDashboardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

type TabType = "overview" | "notes" | "invoices";

// Format helpers
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number, currency: Invoice["currency"] = "USD") {
  const locales: Record<Invoice["currency"], string> = {
    USD: "en-US",
    GBP: "en-GB",
    CAD: "en-CA",
    NGN: "en-NG",
  };

  return new Intl.NumberFormat(locales[currency], {
    style: "currency",
    currency,
  }).format(amount);
}

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  return formatDate(dateString);
}

function ReportCard({ report }: { report: CareReport }) {
  const router = useRouter();
  const isClickable = Boolean(report.href);

  return (
    <div
      className={`flex items-start justify-between gap-4 p-4 rounded-lg border border-border ${
        isClickable ? "hover:bg-background-secondary/50 cursor-pointer" : ""
      }`}
      onClick={() => {
        if (report.href) router.push(report.href);
      }}
    >
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-green-600" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-foreground">{report.title}</p>
            <Badge variant={report.source === "visit-note" ? "success" : "default"} className="text-[10px]">
              {report.statusLabel}
            </Badge>
          </div>
          <p className="text-sm text-foreground-secondary mt-1">
            {report.client.firstName} {report.client.lastName} &bull; Report date {formatDate(report.date)}
          </p>
          <p className="text-sm text-foreground-secondary">
            {report.carer.firstName} {report.carer.lastName}
            {report.shift && ` &bull; ${formatTime(report.shift.scheduledStart)} - ${formatTime(report.shift.scheduledEnd)}`}
          </p>
          {report.summary && (
            <p className="text-sm text-foreground-secondary mt-2 line-clamp-2">
              {report.summary}
            </p>
          )}
          <p className="text-xs text-foreground-tertiary mt-1">
            Submitted {getRelativeTime(report.submittedAt)}
          </p>
        </div>
      </div>
      {isClickable && (
        <Button variant="ghost" size="sm" className="flex-shrink-0">
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      )}
    </div>
  );
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const router = useRouter();

  return (
    <div
      className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border hover:bg-background-secondary/50 cursor-pointer"
      onClick={() => router.push(`/invoices/${invoice.id}`)}
    >
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <DollarSign className="w-5 h-5 text-blue-600" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
            <Badge variant={invoice.status === "PAID" ? "success" : invoice.status === "OVERDUE" ? "error" : "default"} className="text-[10px]">
              {invoice.status}
            </Badge>
          </div>
          <p className="text-sm text-foreground-secondary mt-1">
            {invoice.client.firstName} {invoice.client.lastName} &bull; {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
          </p>
          <p className="text-sm text-foreground-secondary">
            Due {invoice.dueDate ? formatDate(invoice.dueDate) : "-"} &bull; Balance {formatCurrency(invoice.amountDue, invoice.currency)}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-foreground">{formatCurrency(invoice.total, invoice.currency)}</p>
        <Button variant="ghost" size="sm" className="mt-1">
          View
        </Button>
      </div>
    </div>
  );
}

export function SponsorDashboard({ user }: SponsorDashboardProps) {
  const router = useRouter();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [careReports, setCareReports] = React.useState<CareReport[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabType>("overview");

  const fetchInvoices = React.useCallback(async () => {
    const response = await fetch("/api/invoices");
    if (response.ok) {
      const data = await response.json();
      setInvoices(data.invoices || []);
    }
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, reportsRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/dashboard/sponsor-reports?limit=50"),
        ]);

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.clients || []);
        }

        if (reportsRes.ok) {
          const data = await reportsRes.json();
          setCareReports(data.reports || []);
        }

        await fetchInvoices();
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchInvoices]);

  React.useEffect(() => {
    if (activeTab === "invoices") {
      fetchInvoices().catch((error) => {
        console.error("Failed to fetch invoices:", error);
      });
    }
  }, [activeTab, fetchInvoices]);

  const client = clients[0];
  const age = client ? calculateAge(client.dateOfBirth) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-heading-2 text-foreground">Welcome, {user.firstName}</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">Family Member Dashboard</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No clients associated with your account yet.</p>
            <p className="text-sm text-foreground-tertiary mt-2">Please contact your care agency.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-semibold text-primary">
              {client.firstName[0]}{client.lastName[0]}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-heading-2 text-foreground">
                {client.firstName} {client.lastName}
              </h1>
              <Badge variant={client.status === "ACTIVE" ? "success" : "default"}>
                {client.status === "ACTIVE" ? "Receiving Care" : client.status}
              </Badge>
            </div>
            <p className="text-body-sm text-foreground-secondary mt-1">
              {age ? `${age} years old` : "Your loved one"} {client.assignedCarer && `• Caregiver: ${client.assignedCarer.firstName} ${client.assignedCarer.lastName}`}
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => router.push(`/clients/${client.id}`)}>
          View Profile
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "notes"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-2" />
            Daily Reports
            {careReports.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-background-secondary text-xs">
                {careReports.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "invoices"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Invoices
            {invoices.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-background-secondary text-xs">
                {invoices.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                        <User className="w-3 h-3" /> Full Name
                      </p>
                      <p className="font-medium">{client.firstName} {client.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </p>
                      <p className="font-medium">{client.phone || "-"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Age
                      </p>
                      <p className="font-medium">{age ? `${age} years` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Address
                      </p>
                      <p className="font-medium">{client.address || "-"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Daily Reports */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Daily Reports</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("notes")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {careReports.length === 0 ? (
                  <p className="text-center text-foreground-secondary py-8">
                    No daily reports yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {careReports.slice(0, 5).map((report) => (
                      <ReportCard key={`${report.source}-${report.id}`} report={report} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Caregiver Card */}
            {client.assignedCarer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-error" />
                    Caregiver
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-teal-700">
                        {client.assignedCarer.firstName[0]}{client.assignedCarer.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {client.assignedCarer.firstName} {client.assignedCarer.lastName}
                      </p>
                      <p className="text-sm text-foreground-secondary">Primary Caregiver</p>
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full mt-4" onClick={() => router.push("/chat")}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveTab("notes")}>
                  <FileText className="w-4 h-4 mr-2" />
                  View All Reports
                </Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => router.push("/scheduling")}>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => router.push("/invoices")}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Invoices
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Daily Reports</CardTitle>
                <p className="text-sm text-foreground-secondary mt-1">
                  Approved reports for clients associated with your account.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab("notes")}>
                Full List
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {careReports.length === 0 ? (
              <p className="text-center text-foreground-secondary py-8">
                No daily reports submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {careReports.map((report) => (
                  <ReportCard key={`${report.source}-${report.id}`} report={report} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "invoices" && (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-center text-foreground-secondary py-8">
                No invoices yet.
              </p>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
