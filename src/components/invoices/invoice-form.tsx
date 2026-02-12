"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  X,
  Loader2,
  Plus,
  Trash2,
  Calculator,
  Calendar,
  FileText,
  User
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

// Types
interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface Sponsor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface LineItem {
  id?: string;
  type: "SHIFT" | "CUSTOM";
  description: string;
  quantity: number;
  unitPrice: number;
  shiftId?: string;
  serviceDate?: string;
}

interface InvoiceFormData {
  clientId: string;
  sponsorId?: string;
  periodStart: string;
  periodEnd: string;
  dueDate?: string;
  notes?: string;
  taxRate: number;
  lineItems: LineItem[];
  status: "DRAFT" | "PENDING";
}

interface InvoiceFormProps {
  initialData?: InvoiceFormData & { id?: string; clientName?: string; sponsorName?: string };
  onCancel: () => void;
}

const defaultLineItem: LineItem = {
  type: "CUSTOM",
  description: "",
  quantity: 1,
  unitPrice: 0,
};

export function InvoiceForm({
  initialData,
  onCancel,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form state
  const [clientId, setClientId] = React.useState(initialData?.clientId || "");
  const [sponsorId, setSponsorId] = React.useState(initialData?.sponsorId || "");
  const [periodStart, setPeriodStart] = React.useState(
    initialData?.periodStart || new Date().toISOString().split("T")[0]
  );
  const [periodEnd, setPeriodEnd] = React.useState(
    initialData?.periodEnd || new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = React.useState(initialData?.dueDate || "");
  const [notes, setNotes] = React.useState(initialData?.notes || "");
  const [taxRate, setTaxRate] = React.useState(initialData?.taxRate || 0);
  const [lineItems, setLineItems] = React.useState<LineItem[]>(
    initialData?.lineItems?.length ? initialData.lineItems : [{ ...defaultLineItem }]
  );

  // Client autocomplete state
  const [clientSearch, setClientSearch] = React.useState("");
  const [clientSuggestions, setClientSuggestions] = React.useState<Client[]>([]);
  const [selectedClientName, setSelectedClientName] = React.useState(initialData?.clientName || "");
  const [showClientDropdown, setShowClientDropdown] = React.useState(false);
  const clientDropdownRef = React.useRef<HTMLDivElement>(null);

  // Sponsor autocomplete state
  const [sponsorSearch, setSponsorSearch] = React.useState("");
  const [sponsorSuggestions, setSponsorSuggestions] = React.useState<Sponsor[]>([]);
  const [selectedSponsorName, setSelectedSponsorName] = React.useState(initialData?.sponsorName || "");
  const [showSponsorDropdown, setShowSponsorDropdown] = React.useState(false);
  const sponsorDropdownRef = React.useRef<HTMLDivElement>(null);

  // Search clients for autocomplete
  const searchClients = React.useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setClientSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`/api/clients?search=${encodeURIComponent(query)}&status=ACTIVE&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setClientSuggestions(data.clients || []);
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Search sponsors for autocomplete
  const searchSponsors = React.useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSponsorSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`/api/sponsors?search=${encodeURIComponent(query)}&status=active&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setSponsorSuggestions(data.sponsors || []);
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Debounced client search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (clientSearch) {
        searchClients(clientSearch);
      } else {
        setClientSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearch, searchClients]);

  // Debounced sponsor search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (sponsorSearch) {
        searchSponsors(sponsorSearch);
      } else {
        setSponsorSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [sponsorSearch, searchSponsors]);

  // Click outside handler for dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false);
      }
      if (sponsorDropdownRef.current && !sponsorDropdownRef.current.contains(event.target as Node)) {
        setShowSponsorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculations
  const subtotal = lineItems.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice),
    0
  );
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const addLineItem = () => {
    setLineItems([...lineItems, { ...defaultLineItem }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleSubmit = async (status: "DRAFT" | "PENDING") => {
    setError(null);

    // Validation
    if (!clientId) {
      setError("Please select a client");
      return;
    }

    if (!periodStart || !periodEnd) {
      setError("Please specify the billing period");
      return;
    }

    if (lineItems.length === 0 || lineItems.every(item => !item.description)) {
      setError("Please add at least one line item");
      return;
    }

    // Filter out empty line items
    const validLineItems = lineItems.filter(item => item.description.trim());

    if (validLineItems.length === 0) {
      setError("Please add at least one line item with a description");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: InvoiceFormData = {
        clientId,
        sponsorId: sponsorId || undefined,
        periodStart,
        periodEnd,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        taxRate,
        lineItems: validLineItems.map(item => ({
          type: item.type,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          shiftId: item.shiftId || undefined,
          serviceDate: item.serviceDate || undefined,
        })),
        status,
      };

      const url = initialData?.id
        ? `/api/invoices/${initialData.id}`
        : "/api/invoices";
      const method = initialData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save invoice");
      }

      const data = await response.json();
      router.push(`/invoices/${data.invoice.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      {/* Client & Billing Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Client & Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientId">Client *</Label>
            <div className="relative" ref={clientDropdownRef}>
              <Input
                id="clientId"
                placeholder="Start typing to search clients..."
                value={selectedClientName || clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setSelectedClientName("");
                  setClientId("");
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                autoComplete="off"
                disabled={!!initialData?.id}
              />
              {selectedClientName && !initialData?.id && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground"
                  onClick={() => {
                    setSelectedClientName("");
                    setClientSearch("");
                    setClientId("");
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showClientDropdown && clientSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {clientSuggestions.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-background-secondary text-sm"
                      onClick={() => {
                        setClientId(client.id);
                        setSelectedClientName(`${client.firstName} ${client.lastName}`);
                        setClientSearch("");
                        setShowClientDropdown(false);
                      }}
                    >
                      {client.firstName} {client.lastName}
                    </button>
                  ))}
                </div>
              )}
              {showClientDropdown && clientSearch.length >= 2 && clientSuggestions.length === 0 && (
                <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3 text-sm text-foreground-tertiary">
                  No clients found
                </div>
              )}
            </div>
            <p className="text-xs text-foreground-tertiary mt-1">
              Type at least 2 characters to search
            </p>
          </div>

          <div>
            <Label htmlFor="sponsorId">Bill To (Sponsor)</Label>
            <div className="relative" ref={sponsorDropdownRef}>
              <Input
                id="sponsorId"
                placeholder="Start typing to search sponsors..."
                value={selectedSponsorName || sponsorSearch}
                onChange={(e) => {
                  setSponsorSearch(e.target.value);
                  setSelectedSponsorName("");
                  setSponsorId("");
                  setShowSponsorDropdown(true);
                }}
                onFocus={() => setShowSponsorDropdown(true)}
                autoComplete="off"
              />
              {selectedSponsorName && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground"
                  onClick={() => {
                    setSelectedSponsorName("");
                    setSponsorSearch("");
                    setSponsorId("");
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showSponsorDropdown && sponsorSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {sponsorSuggestions.map((sponsor) => (
                    <button
                      key={sponsor.id}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-background-secondary text-sm"
                      onClick={() => {
                        setSponsorId(sponsor.id);
                        setSelectedSponsorName(`${sponsor.firstName} ${sponsor.lastName} (${sponsor.email})`);
                        setSponsorSearch("");
                        setShowSponsorDropdown(false);
                      }}
                    >
                      {sponsor.firstName} {sponsor.lastName} ({sponsor.email})
                    </button>
                  ))}
                </div>
              )}
              {showSponsorDropdown && sponsorSearch.length >= 2 && sponsorSuggestions.length === 0 && (
                <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3 text-sm text-foreground-tertiary">
                  No sponsors found
                </div>
              )}
            </div>
            <p className="text-xs text-foreground-tertiary mt-1">
              Leave empty to bill the client directly. Type at least 2 characters to search.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Period & Due Date */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Billing Period
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="periodStart">Period Start *</Label>
            <Input
              id="periodStart"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="periodEnd">Period End *</Label>
            <Input
              id="periodEnd"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Line Items
          </CardTitle>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addLineItem}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header */}
            <div className="hidden md:grid md:grid-cols-10 gap-2 text-sm font-medium text-foreground-secondary">
              <div className="col-span-1">Type</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-1 text-right">Qty</div>
              <div className="col-span-1 text-right">Rate</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>

            {/* Items */}
            {lineItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-10 gap-2 items-start border-b border-border pb-4 md:border-0 md:pb-0"
              >
                <div className="md:col-span-1">
                  <Label className="md:hidden">Type</Label>
                  <Select
                    value={item.type}
                    onChange={(e) =>
                      updateLineItem(index, "type", e.target.value as "SHIFT" | "CUSTOM")
                    }
                  >
                    <option value="CUSTOM">Custom</option>
                    <option value="SHIFT">Shift</option>
                  </Select>
                </div>

                <div className="md:col-span-5">
                  <Label className="md:hidden">Description</Label>
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, "description", e.target.value)}
                  />
                </div>

                <div className="md:col-span-1">
                  <Label className="md:hidden">Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    className="text-right"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="md:col-span-1">
                  <Label className="md:hidden">Rate</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="text-right"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="md:col-span-1 flex items-center justify-end">
                  <span className="text-sm font-medium">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </div>

                <div className="md:col-span-1 flex items-center justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                    className="text-foreground-tertiary hover:text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex flex-col items-end gap-2">
              <div className="flex justify-between w-full max-w-xs text-sm">
                <span className="text-foreground-secondary">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center w-full max-w-xs gap-4">
                <span className="text-foreground-secondary text-sm">Tax Rate (%):</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-20 text-right text-sm"
                  value={(taxRate * 100).toFixed(1)}
                  onChange={(e) => setTaxRate((parseFloat(e.target.value) || 0) / 100)}
                />
              </div>

              <div className="flex justify-between w-full max-w-xs text-sm">
                <span className="text-foreground-secondary">Tax:</span>
                <span className="font-medium">${taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between w-full max-w-xs text-lg font-semibold pt-2 border-t border-border">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any notes or special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSubmit("DRAFT")}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit("PENDING")}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4 mr-2" />
          )}
          Create Invoice
        </Button>
      </div>
    </div>
  );
}
