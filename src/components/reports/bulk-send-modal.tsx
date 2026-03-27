"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  X,
  Send,
  Search,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ClientWithSponsor {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  hasSponsor: boolean;
  sponsorHasEmail: boolean;
  sponsor: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  canSendReport: boolean;
}

interface BulkSendResult {
  clientId: string;
  clientName: string;
  status: "sent" | "skipped" | "failed";
  sentTo?: string;
  error?: string;
}

interface BulkSendResponse {
  success: boolean;
  results: BulkSendResult[];
  summary: {
    sent: number;
    skipped: number;
    failed: number;
    total: number;
  };
}

interface BulkSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedReportId: string;
  savedReportName: string;
}

type TimePreset = "7d" | "30d" | "90d" | "custom";

export function BulkSendModal({
  isOpen,
  onClose,
  savedReportId,
  savedReportName,
}: BulkSendModalProps) {
  const [clients, setClients] = useState<ClientWithSponsor[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingClients, setIsFetchingClients] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [results, setResults] = useState<BulkSendResponse | null>(null);

  // Date range options
  const [timePreset, setTimePreset] = useState<TimePreset>("30d");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Email customization
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailIntro, setEmailIntro] = useState("");
  const [emailClosing, setEmailClosing] = useState("");

  // Preview state
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewClientId, setPreviewClientId] = useState<string | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewClientName, setPreviewClientName] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadClientId, setDownloadClientId] = useState<string | null>(null);

  // Fetch clients when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchClients();
      setResults(null);
      setSelectedClientIds(new Set());
    } else {
      // Clean up preview URL when modal closes
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
        setPreviewPdfUrl(null);
        setPreviewClientName("");
      }
    }
  }, [isOpen]);

  const fetchClients = async () => {
    setIsFetchingClients(true);
    try {
      const response = await fetch("/api/clients/with-sponsors?status=ACTIVE");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      toast.error("Failed to load clients");
    } finally {
      setIsFetchingClients(false);
    }
  };

  // Filter clients by search
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(
      (client) =>
        client.fullName.toLowerCase().includes(query) ||
        client.sponsor?.fullName.toLowerCase().includes(query) ||
        client.sponsor?.email.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  // Get counts
  const selectableClients = filteredClients.filter((c) => c.canSendReport);
  const selectedCount = selectedClientIds.size;
  const canSendCount = Array.from(selectedClientIds).filter((id) =>
    clients.find((c) => c.id === id && c.canSendReport)
  ).length;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLoading]);

  const handleClose = () => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  const handlePreviewPDF = async (clientId: string, clientName: string) => {
    setIsPreviewLoading(true);
    setPreviewClientId(clientId);
    try {
      const params = new URLSearchParams({ clientId });
      if (timePreset === "custom" && customStartDate && customEndDate) {
        params.set("startDate", customStartDate);
        params.set("endDate", customEndDate);
      }

      const response = await fetch(
        `/api/reports/saved/${savedReportId}/preview?${params}`
      );

      if (response.ok) {
        const blob = await response.blob();
        // Revoke previous URL if exists
        if (previewPdfUrl) {
          URL.revokeObjectURL(previewPdfUrl);
        }
        const url = URL.createObjectURL(blob);
        setPreviewPdfUrl(url);
        setPreviewClientName(clientName);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to generate preview");
      }
    } catch (err) {
      console.error("Failed to generate preview:", err);
      toast.error("Failed to generate preview");
    } finally {
      setIsPreviewLoading(false);
      setPreviewClientId(null);
    }
  };

  const handleDownloadPDF = async (clientId: string, clientName: string) => {
    setIsDownloading(true);
    setDownloadClientId(clientId);
    try {
      const params = new URLSearchParams({ clientId });
      if (timePreset === "custom" && customStartDate && customEndDate) {
        params.set("startDate", customStartDate);
        params.set("endDate", customEndDate);
      }

      const response = await fetch(
        `/api/reports/saved/${savedReportId}/preview?${params}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${clientName.replace(/\s+/g, "_")}_Trends_Report.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("PDF downloaded successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to download PDF");
      }
    } catch (err) {
      console.error("Failed to download PDF:", err);
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
      setDownloadClientId(null);
    }
  };

  const closePreview = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
    setPreviewClientName("");
  };

  const toggleClient = (clientId: string) => {
    setSelectedClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedClientIds(new Set(selectableClients.map((c) => c.id)));
  };

  const clearAll = () => {
    setSelectedClientIds(new Set());
  };

  const handleSend = async () => {
    if (selectedClientIds.size === 0) return;

    setIsLoading(true);
    try {
      const body: {
        savedReportId: string;
        clientIds: string[];
        startDate?: string;
        endDate?: string;
        emailSubject?: string;
        emailIntro?: string;
        emailClosing?: string;
      } = {
        savedReportId,
        clientIds: Array.from(selectedClientIds),
      };

      if (timePreset === "custom" && customStartDate && customEndDate) {
        body.startDate = customStartDate;
        body.endDate = customEndDate;
      }

      // Add custom email content if provided
      if (emailSubject.trim()) {
        body.emailSubject = emailSubject.trim();
      }
      if (emailIntro.trim()) {
        body.emailIntro = emailIntro.trim();
      }
      if (emailClosing.trim()) {
        body.emailClosing = emailClosing.trim();
      }

      const response = await fetch("/api/reports/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data: BulkSendResponse = await response.json();
        setResults(data);

        if (data.summary.sent > 0) {
          toast.success(`Successfully sent ${data.summary.sent} report(s)`);
        }
        if (data.summary.failed > 0) {
          toast.error(`Failed to send ${data.summary.failed} report(s)`);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send reports");
      }
    } catch (err) {
      console.error("Failed to send reports:", err);
      toast.error("Failed to send reports");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    {/* PDF Preview Modal */}
    {previewPdfUrl && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/60"
          onClick={closePreview}
        />
        <div className="relative bg-background rounded-xl shadow-2xl w-full max-w-4xl mx-4 h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">PDF Preview - {previewClientName}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = previewPdfUrl;
                  link.download = `${previewClientName.replace(/\s+/g, "_")}_Trends_Report.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <button
                onClick={closePreview}
                className="p-1 text-foreground-tertiary hover:text-foreground rounded-lg hover:bg-background-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-900">
            <iframe
              src={previewPdfUrl}
              className="w-full h-full rounded-lg border-0"
              title="PDF Preview"
            />
          </div>
        </div>
      </div>
    )}
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-150",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-background rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col transition-all duration-150",
          isClosing
            ? "opacity-0 scale-95"
            : "opacity-100 scale-100 animate-in fade-in zoom-in-95"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Send Report to Sponsors</h2>
            <p className="text-sm text-foreground-secondary">
              Template: {savedReportName}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 text-foreground-tertiary hover:text-foreground rounded-lg hover:bg-background-secondary transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {results ? (
            // Results view
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-background-secondary">
                <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-success">
                      {results.summary.sent}
                    </div>
                    <div className="text-xs text-foreground-secondary">Sent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning">
                      {results.summary.skipped}
                    </div>
                    <div className="text-xs text-foreground-secondary">Skipped</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-error">
                      {results.summary.failed}
                    </div>
                    <div className="text-xs text-foreground-secondary">Failed</div>
                  </div>
                </div>
              </div>

              <div className="overflow-auto max-h-[300px] space-y-2">
                {results.results.map((result) => (
                  <div
                    key={result.clientId}
                    className="flex items-center justify-between p-3 rounded-lg bg-background-secondary"
                  >
                    <div className="flex items-center gap-3">
                      {result.status === "sent" && (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                      {result.status === "skipped" && (
                        <AlertCircle className="w-4 h-4 text-warning" />
                      )}
                      {result.status === "failed" && (
                        <X className="w-4 h-4 text-error" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{result.clientName}</div>
                        {result.sentTo && (
                          <div className="text-xs text-foreground-secondary">
                            Sent to: {result.sentTo}
                          </div>
                        )}
                        {result.error && (
                          <div className="text-xs text-error">{result.error}</div>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        result.status === "sent" &&
                          "bg-success/10 text-success",
                        result.status === "skipped" &&
                          "bg-warning/10 text-warning",
                        result.status === "failed" && "bg-error/10 text-error"
                      )}
                    >
                      {result.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="default" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            // Selection view
            <>
              {/* Date Range Selection */}
              <div className="mb-4 p-3 rounded-lg bg-background-secondary">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-foreground-secondary" />
                  <span className="text-sm font-medium">Date Range</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["7d", "30d", "90d", "custom"] as TimePreset[]).map(
                    (preset) => (
                      <button
                        key={preset}
                        onClick={() => setTimePreset(preset)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm transition-colors",
                          timePreset === preset
                            ? "bg-primary text-primary-foreground"
                            : "bg-background hover:bg-background-secondary"
                        )}
                      >
                        {preset === "7d" && "7 Days"}
                        {preset === "30d" && "30 Days"}
                        {preset === "90d" && "90 Days"}
                        {preset === "custom" && "Custom"}
                      </button>
                    )
                  )}
                </div>
                {timePreset === "custom" && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      placeholder="Start date"
                    />
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      placeholder="End date"
                    />
                  </div>
                )}
              </div>

              {/* Email Customization */}
              <div className="mb-4 border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowEmailOptions(!showEmailOptions)}
                  className="w-full flex items-center justify-between p-3 bg-background-secondary hover:bg-background-secondary/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-foreground-secondary" />
                    <span className="text-sm font-medium">Customize Email</span>
                    {(emailSubject || emailIntro || emailClosing) && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary">
                        Customized
                      </span>
                    )}
                  </div>
                  {showEmailOptions ? (
                    <ChevronUp className="w-4 h-4 text-foreground-secondary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-foreground-secondary" />
                  )}
                </button>
                {showEmailOptions && (
                  <div className="p-3 space-y-3 border-t bg-background">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground-secondary">
                        Email Subject (optional)
                      </label>
                      <Input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Default: Trends Report: [Client Name] - [Report Name]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground-secondary">
                        Introduction Message (optional)
                      </label>
                      <textarea
                        value={emailIntro}
                        onChange={(e) => setEmailIntro(e.target.value)}
                        placeholder="Default: Please find attached the trends report for [Client Name]..."
                        rows={2}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground-secondary">
                        Closing Message (optional)
                      </label>
                      <textarea
                        value={emailClosing}
                        onChange={(e) => setEmailClosing(e.target.value)}
                        placeholder="Default: If you have any questions about this report, please don't hesitate to contact us."
                        rows={2}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <p className="text-xs text-foreground-tertiary">
                      Leave fields empty to use default content. Use [Client Name] and [Sponsor Name] as placeholders.
                    </p>
                  </div>
                )}
              </div>

              {/* Search and Selection Controls */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
                  <Input
                    type="text"
                    placeholder="Search clients or sponsors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear
                </Button>
              </div>

              {/* Client List */}
              <div className="max-h-[280px] overflow-auto border rounded-lg">
                {isFetchingClients ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-foreground-secondary">
                    <User className="w-8 h-8 mb-2" />
                    <p className="text-sm">No clients found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className={cn(
                          "flex items-center gap-3 p-3 hover:bg-background-secondary transition-colors",
                          !client.canSendReport && "opacity-50"
                        )}
                      >
                        <Checkbox
                          checked={selectedClientIds.has(client.id)}
                          onChange={() => toggleClient(client.id)}
                          disabled={!client.canSendReport}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {client.fullName}
                          </div>
                          {client.sponsor ? (
                            <div className="flex items-center gap-1 text-xs text-foreground-secondary">
                              <Mail className="w-3 h-3" />
                              {client.sponsor.email || "No email"}
                              <span className="text-foreground-tertiary">
                                ({client.sponsor.fullName})
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-warning">
                              <AlertCircle className="w-3 h-3" />
                              No sponsor assigned
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewPDF(client.id, client.fullName);
                            }}
                            disabled={isPreviewLoading && previewClientId === client.id}
                            className="p-1.5 rounded-md hover:bg-background text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
                            title="Preview PDF"
                          >
                            {isPreviewLoading && previewClientId === client.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(client.id, client.fullName);
                            }}
                            disabled={isDownloading && downloadClientId === client.id}
                            className="p-1.5 rounded-md hover:bg-background text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
                            title="Download PDF"
                          >
                            {isDownloading && downloadClientId === client.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          {!client.canSendReport && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-warning/10 text-warning ml-1">
                              {!client.hasSponsor
                                ? "No sponsor"
                                : "No email"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </>
          )}
        </div>

        {/* Footer - Always visible */}
        {!results && (
          <div className="border-t p-4 bg-background">
            <div className="flex items-center justify-between mb-3 text-sm text-foreground-secondary">
              <span>
                {selectedCount} client{selectedCount !== 1 ? "s" : ""} selected
              </span>
              <span>
                {canSendCount} email{canSendCount !== 1 ? "s" : ""} will be sent
              </span>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isLoading || canSendCount === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send {canSendCount} Report{canSendCount !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
