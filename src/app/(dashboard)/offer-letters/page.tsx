"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Input,
  type ColumnDef,
} from "@/components/ui";
import { Download, FileSignature, Plus, RefreshCw, Search, UserPlus, XCircle } from "lucide-react";

interface OfferLetter {
  id: string;
  status: string;
  recipientEmail: string;
  recipientFirstName: string;
  recipientLastName: string;
  renderedSubject: string;
  sentAt: string | null;
  viewedAt: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  expiresAt: string;
  template?: { id: string; name: string };
  employee?: { id: string; firstName: string; lastName: string; email: string } | null;
  sentBy?: { firstName: string; lastName: string };
}

const STATUS_VARIANTS: Record<string, "primary" | "success" | "warning" | "error" | "default"> = {
  SENT: "primary",
  VIEWED: "warning",
  ACCEPTED: "success",
  DECLINED: "error",
  EXPIRED: "default",
  CANCELLED: "default",
};

export default function OfferLettersPage() {
  const [offers, setOffers] = React.useState<OfferLetter[]>([]);
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchOffers = React.useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    try {
      const response = await fetch(`/api/offer-letters?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch offers");
      setOffers(data.offers || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch offers");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const cancelOffer = async (offer: OfferLetter) => {
    try {
      const response = await fetch(`/api/offer-letters/${offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to cancel offer");
      toast.success("Offer cancelled");
      fetchOffers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel offer");
    }
  };

  const createStaffFromOffer = async (offer: OfferLetter) => {
    try {
      const response = await fetch(`/api/offer-letters/${offer.id}/create-staff`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create staff account");
      toast.success(data.linkedExisting ? "Offer linked to existing staff account" : "Staff account created");
      fetchOffers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create staff account");
    }
  };

  const downloadPdf = (offer: OfferLetter) => {
    window.open(`/api/offer-letters/${offer.id}/pdf`, "_blank");
  };

  const columns: ColumnDef<OfferLetter>[] = [
    {
      id: "recipient",
      header: "Recipient",
      cell: (row) => (
        <div>
          <p className="font-medium">
            {row.recipientFirstName} {row.recipientLastName}
          </p>
          <p className="text-foreground-secondary">{row.recipientEmail}</p>
        </div>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.renderedSubject}</p>
          <p className="text-foreground-secondary">{row.template?.name || "Template"}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={STATUS_VARIANTS[row.status] || "default"}>{row.status}</Badge>
      ),
    },
    {
      id: "sentAt",
      header: "Sent",
      cell: (row) => row.sentAt ? new Date(row.sentAt).toLocaleDateString() : "-",
    },
    {
      id: "expiresAt",
      header: "Expires",
      cell: (row) => new Date(row.expiresAt).toLocaleDateString(),
    },
  ];

  const canCancel = (status: string) => ["SENT", "VIEWED"].includes(status);
  const canCreateStaff = (offer: OfferLetter) => offer.status === "ACCEPTED" && !offer.employee;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Offer Letters</h1>
          <p className="text-sm text-foreground-secondary">
            Send and track job offer letters for staff and candidates.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/offer-letters/templates">
            <Button variant="secondary">Templates</Button>
          </Link>
          <Link href="/offer-letters/send">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Send Offer
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Sent Offers</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-secondary" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search offers..."
                  className="pl-9"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={fetchOffers}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={offers}
            columns={columns}
            isLoading={isLoading}
            getRowKey={(row) => row.id}
            emptyIcon={<FileSignature className="h-12 w-12" />}
            emptyMessage="No offer letters sent yet."
            rowActions={(row) =>
              <div className="flex justify-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadPdf(row)}
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </Button>
                {canCreateStaff(row) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => createStaffFromOffer(row)}
                    title="Create staff account"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                )}
                {canCancel(row.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelOffer(row)}
                    title="Cancel offer"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
