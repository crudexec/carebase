"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ClipboardCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
} from "@/components/ui";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { NarcoticCountModal } from "@/components/emar/narcotics/narcotic-count-modal";
import { AddInventoryModal } from "@/components/emar/narcotics/add-inventory-modal";
import { toast } from "sonner";
import { format } from "date-fns";
import { CONTROLLED_SCHEDULE_LABELS } from "@/lib/emar/types";

interface InventoryItem {
  id: string;
  medicationId: string;
  medicationName: string;
  genericName: string | null;
  strength: string;
  form: string;
  controlledSchedule: string;
  clientId: string;
  clientName: string;
  quantityOnHand: number;
  lotNumber: string | null;
  expirationDate: string | null;
  lowInventoryThreshold: number | null;
  isLowInventory: boolean;
  lastVerifiedAt: string;
  lastVerifiedByName: string | null;
  lastCount: {
    id: string;
    countTime: string;
    shiftType: string;
    status: string;
    currentCount: number;
    discrepancy: number;
  } | null;
}

interface RecentCount {
  id: string;
  countTime: string;
  shiftType: string;
  status: string;
  previousCount: number;
  currentCount: number;
  expectedCount: number;
  discrepancy: number;
  inventory: {
    medication: {
      id: string;
      name: string;
      strength: string;
      controlledSchedule: string;
    };
  };
  countedBy: {
    firstName: string;
    lastName: string;
  };
  verifiedBy: {
    firstName: string;
    lastName: string;
  } | null;
}

type ShiftType = "DAY" | "EVENING" | "NIGHT" | "";

export default function NarcoticsPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recentCounts, setRecentCounts] = useState<RecentCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shiftFilter, setShiftFilter] = useState<ShiftType>("");
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [inventoryRes, countsRes] = await Promise.all([
        fetch("/api/narcotic-inventory"),
        fetch(`/api/narcotic-counts?limit=10${shiftFilter ? `&shiftType=${shiftFilter}` : ""}`),
      ]);

      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        setInventory(inventoryData.inventory || []);
      }

      if (countsRes.ok) {
        const countsData = await countsRes.json();
        setRecentCounts(countsData.counts || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [shiftFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCurrentShift = (): ShiftType => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return "DAY";
    if (hour >= 14 && hour < 22) return "EVENING";
    return "NIGHT";
  };

  const handleStartCount = (item: InventoryItem) => {
    setSelectedInventory(item);
    setIsCountModalOpen(true);
  };

  const handleCountSuccess = () => {
    fetchData();
    setIsCountModalOpen(false);
    setSelectedInventory(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge variant="success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "DISCREPANCY":
        return (
          <Badge variant="error">
            <XCircle className="h-3 w-3 mr-1" />
            Discrepancy
          </Badge>
        );
      default:
        return (
          <Badge variant="warning">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const pendingVerifications = recentCounts.filter((c) => c.status === "PENDING");
  const discrepancies = recentCounts.filter((c) => c.status === "DISCREPANCY");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "eMAR", href: "/emar" },
          { label: "Narcotic Counts" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Narcotic Counts
          </h1>
          <p className="text-muted-foreground">
            Manage controlled substance counts and verification
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value as ShiftType)}
            className="w-[150px] min-h-[44px]"
          >
            <option value="">All Shifts</option>
            <option value="DAY">Day Shift</option>
            <option value="EVENING">Evening Shift</option>
            <option value="NIGHT">Night Shift</option>
          </Select>
        </div>
      </div>

      {/* Alert Cards */}
      {discrepancies.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-900">
                  {discrepancies.length} Unresolved Discrepanc{discrepancies.length === 1 ? "y" : "ies"}
                </p>
                <p className="text-sm text-red-700">
                  Requires immediate attention and documentation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingVerifications.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">
                  {pendingVerifications.length} Count{pendingVerifications.length === 1 ? "" : "s"} Pending Verification
                </p>
                <p className="text-sm text-yellow-700">
                  Awaiting witness signature
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Shift Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Current Shift: {getCurrentShift()}
            </span>
            <Badge variant="primary">
              {format(new Date(), "h:mm a")}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Controlled Substances Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Controlled Substances</span>
            <div className="flex items-center gap-2">
              <Badge variant="default">{inventory.length}</Badge>
              <Button
                onClick={() => setIsAddInventoryModalOpen(true)}
                className="min-h-[44px] px-4 touch-manipulation"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Inventory
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No controlled substances found</p>
              <p className="text-sm">
                Controlled medications will appear here when added
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    item.isLowInventory
                      ? "border-red-200 bg-red-50"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.medicationName}</span>
                      <Badge variant="warning" className="text-xs">
                        {CONTROLLED_SCHEDULE_LABELS[item.controlledSchedule as keyof typeof CONTROLLED_SCHEDULE_LABELS]}
                      </Badge>
                      {item.isLowInventory && (
                        <Badge variant="error" className="text-xs">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.strength} {item.form} - {item.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last verified: {format(new Date(item.lastVerifiedAt), "MMM d, h:mm a")}
                      {item.lastVerifiedByName && ` by ${item.lastVerifiedByName}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{item.quantityOnHand}</p>
                      <p className="text-xs text-muted-foreground">on hand</p>
                    </div>

                    {item.lastCount && (
                      <div className="text-right">
                        {getStatusBadge(item.lastCount.status)}
                      </div>
                    )}

                    <Button
                      onClick={() => handleStartCount(item)}
                      className="min-h-[44px] px-4 touch-manipulation"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Count
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Counts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Counts</span>
            <Link href="/emar/narcotics/history">
              <Button variant="secondary" className="min-h-[44px] touch-manipulation">
                View All History
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent counts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCounts.map((count) => (
                <div
                  key={count.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {count.inventory.medication.name}
                      </span>
                      <Badge variant="default" className="text-xs">
                        {count.shiftType}
                      </Badge>
                      {getStatusBadge(count.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {count.inventory.medication.strength} -{" "}
                      {format(new Date(count.countTime), "MMM d, h:mm a")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Counted by {count.countedBy.firstName} {count.countedBy.lastName}
                      {count.verifiedBy && (
                        <>, verified by {count.verifiedBy.firstName} {count.verifiedBy.lastName}</>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Previous</p>
                      <p className="font-medium">{count.previousCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-medium">{count.currentCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Expected</p>
                      <p className="font-medium">{count.expectedCount}</p>
                    </div>
                    {count.discrepancy !== 0 && (
                      <div className="text-center">
                        <p className="text-muted-foreground">Discrepancy</p>
                        <p className={`font-medium ${count.discrepancy > 0 ? "text-green-600" : "text-red-600"}`}>
                          {count.discrepancy > 0 ? "+" : ""}{count.discrepancy}
                        </p>
                      </div>
                    )}
                  </div>

                  {count.status === "PENDING" && (
                    <Link href={`/emar/narcotics/verify/${count.id}`}>
                      <Button
                        variant="secondary"
                        className="min-h-[44px] px-4 touch-manipulation ml-4"
                      >
                        Verify
                      </Button>
                    </Link>
                  )}

                  {count.status === "DISCREPANCY" && (
                    <Link href={`/emar/narcotics/resolve/${count.id}`}>
                      <Button
                        variant="error"
                        className="min-h-[44px] px-4 touch-manipulation ml-4"
                      >
                        Resolve
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Count Modal */}
      <NarcoticCountModal
        inventory={selectedInventory}
        isOpen={isCountModalOpen}
        onClose={() => {
          setIsCountModalOpen(false);
          setSelectedInventory(null);
        }}
        onSuccess={handleCountSuccess}
        currentShift={getCurrentShift()}
      />

      {/* Add Inventory Modal */}
      <AddInventoryModal
        isOpen={isAddInventoryModalOpen}
        onClose={() => setIsAddInventoryModalOpen(false)}
        onSuccess={() => {
          setIsAddInventoryModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
