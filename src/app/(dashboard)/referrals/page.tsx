"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
} from "@/components/ui";
import {
  UserPlus,
  Loader2,
  Search,
  Phone,
  Calendar,
  ArrowRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Referral {
  id: string;
  referralNumber: string;
  status: string;
  prospectFirstName: string;
  prospectLastName: string;
  prospectPhone?: string;
  urgency?: string;
  receivedDate: string;
  nextFollowUpDate?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  referralSource?: {
    id: string;
    name: string;
    type: string;
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

export default function ReferralsPage() {
  const router = useRouter();
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [statusCounts, setStatusCounts] = React.useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    fetchReferrals();
  }, [statusFilter]);

  const fetchReferrals = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const response = await fetch(`/api/referrals?${params}`);
      const data = await response.json();

      if (response.ok) {
        setReferrals(data.referrals || []);
        setStatusCounts(data.statusCounts || {});
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReferrals();
  };

  const isOverdue = (followUpDate?: string) => {
    if (!followUpDate) return false;
    return new Date(followUpDate) < new Date();
  };

  const totalActive = (statusCounts.PENDING || 0) +
                      (statusCounts.CONTACTED || 0) +
                      (statusCounts.QUALIFIED || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Referrals</h1>
          <p className="text-foreground-secondary">
            Manage incoming referrals and convert to clients
          </p>
        </div>
        <Link href="/referrals/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            New Referral
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className={`cursor-pointer transition-colors ${
            !statusFilter ? "border-primary" : ""
          }`}
          onClick={() => setStatusFilter("")}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-foreground-secondary">Total Referrals</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${
            statusFilter === "PENDING" ? "border-warning" : ""
          }`}
          onClick={() => setStatusFilter("PENDING")}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">
              {statusCounts.PENDING || 0}
            </div>
            <p className="text-xs text-foreground-secondary">Pending</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${
            statusFilter === "QUALIFIED" ? "border-success" : ""
          }`}
          onClick={() => setStatusFilter("QUALIFIED")}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">
              {statusCounts.QUALIFIED || 0}
            </div>
            <p className="text-xs text-foreground-secondary">Qualified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {statusCounts.CONVERTED || 0}
            </div>
            <p className="text-xs text-foreground-secondary">Converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary" />
              <Input
                placeholder="Search by name, phone, or referral number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Referral List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
        </div>
      ) : referrals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserPlus className="h-12 w-12 text-foreground-tertiary mb-4" />
            <h3 className="text-lg font-medium">No referrals found</h3>
            <p className="text-foreground-secondary text-sm mt-1">
              {statusFilter
                ? `No ${STATUS_LABELS[statusFilter].toLowerCase()} referrals`
                : "Create your first referral to get started"}
            </p>
            <Link href="/referrals/new" className="mt-4">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                New Referral
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {referrals.map((referral) => (
            <Card
              key={referral.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/referrals/${referral.id}`)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {referral.prospectFirstName[0]}
                        {referral.prospectLastName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {referral.prospectFirstName} {referral.prospectLastName}
                        </h3>
                        <Badge className={STATUS_COLORS[referral.status]}>
                          {STATUS_LABELS[referral.status]}
                        </Badge>
                        {referral.urgency === "URGENT" && (
                          <Badge variant="error" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                        {referral.urgency === "STAT" && (
                          <Badge variant="error" className="text-xs">
                            STAT
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-foreground-secondary">
                        <span className="font-mono text-xs">
                          {referral.referralNumber}
                        </span>
                        {referral.prospectPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {referral.prospectPhone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(referral.receivedDate), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Follow-up indicator */}
                    {referral.nextFollowUpDate && (
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          isOverdue(referral.nextFollowUpDate)
                            ? "text-error"
                            : "text-foreground-secondary"
                        }`}
                      >
                        {isOverdue(referral.nextFollowUpDate) ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                        <span>
                          Follow-up{" "}
                          {formatDistanceToNow(new Date(referral.nextFollowUpDate), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    )}

                    {/* Assigned to */}
                    {referral.assignedTo && (
                      <div className="text-sm text-foreground-secondary">
                        <span className="text-xs">Assigned to </span>
                        <span className="font-medium">
                          {referral.assignedTo.firstName} {referral.assignedTo.lastName[0]}.
                        </span>
                      </div>
                    )}

                    {/* Source */}
                    {referral.referralSource && (
                      <Badge className="text-xs">
                        {referral.referralSource.name}
                      </Badge>
                    )}

                    <ArrowRight className="h-4 w-4 text-foreground-tertiary" />
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
