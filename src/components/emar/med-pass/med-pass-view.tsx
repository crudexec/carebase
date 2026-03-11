"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays, subDays } from "date-fns";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  RefreshCw,
  Check,
  Clock,
  XCircle,
  Users,
  Filter,
} from "lucide-react";
import { Button, Card, CardContent, Select } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { MedPassCard } from "./med-pass-card";
import { AdministrationModal } from "./administration-modal";
import { MedPassDose, MedPassResponse } from "@/lib/emar/types";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface MedPassViewProps {
  initialClientId?: string;
}

export function MedPassView({ initialClientId }: MedPassViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || ""
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [medPassData, setMedPassData] = useState<MedPassResponse | null>(null);
  const [activeTimeSlot, setActiveTimeSlot] = useState<string>("Morning");
  const [selectedDose, setSelectedDose] = useState<MedPassDose | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Fetch clients for filter
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients?status=ACTIVE&limit=100");
        if (response.ok) {
          const data = await response.json();
          setClients(data.clients || []);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  // Fetch med pass data
  const fetchMedPass = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams({
        date: selectedDate.toISOString(),
      });
      if (selectedClientId) {
        params.set("clientId", selectedClientId);
      }

      const response = await fetch(`/api/med-pass?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch med pass");
      }
      const data = await response.json();
      setMedPassData(data);

      // Set active time slot based on current time
      const currentHour = new Date().getHours();
      if (currentHour >= 6 && currentHour < 12) {
        setActiveTimeSlot("Morning");
      } else if (currentHour >= 12 && currentHour < 18) {
        setActiveTimeSlot("Afternoon");
      } else if (currentHour >= 18 && currentHour < 22) {
        setActiveTimeSlot("Evening");
      } else {
        setActiveTimeSlot("Night");
      }
    } catch (error) {
      console.error("Error fetching med pass:", error);
      toast.error("Failed to load medication pass");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedDate, selectedClientId]);

  useEffect(() => {
    fetchMedPass();
  }, [fetchMedPass]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchMedPass, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMedPass]);

  const handleAdminister = (dose: MedPassDose) => {
    setSelectedDose(dose);
    setIsAdminModalOpen(true);
  };

  const handleAdminSuccess = () => {
    fetchMedPass();
  };

  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday =
    format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeSlot = medPassData?.timeSlots.find(
    (slot) => slot.label === activeTimeSlot
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={goToPreviousDay}
            className="min-h-[44px] min-w-[44px] p-0 touch-manipulation"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 px-4 py-3 border rounded-md bg-background min-h-[44px]">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </span>
          </div>

          <Button
            variant="secondary"
            onClick={goToNextDay}
            className="min-h-[44px] min-w-[44px] p-0 touch-manipulation"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {!isToday && (
            <Button
              variant="secondary"
              onClick={goToToday}
              className="min-h-[44px] px-4 touch-manipulation"
            >
              Today
            </Button>
          )}
        </div>

        {/* Filters and Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-[200px] min-h-[44px]"
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="secondary"
            onClick={fetchMedPass}
            disabled={isRefreshing}
            className="min-h-[44px] min-w-[44px] p-0 touch-manipulation"
          >
            <RefreshCw
              className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      {medPassData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Doses</p>
                  <p className="text-2xl font-bold">{medPassData.stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {medPassData.stats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {medPassData.stats.completed}
                  </p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Missed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {medPassData.stats.missed}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Slot Tabs */}
      {medPassData && (
        <div className="space-y-4">
          {/* Tab Buttons */}
          <div className="flex gap-1 border-b overflow-x-auto">
            {medPassData.timeSlots.map((slot) => (
              <button
                key={slot.label}
                onClick={() => setActiveTimeSlot(slot.label)}
                className={cn(
                  "px-5 py-3 min-h-[48px] text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap touch-manipulation",
                  activeTimeSlot === slot.label
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground active:bg-muted/50"
                )}
              >
                {slot.label}
                {slot.doses.length > 0 && (
                  <Badge
                    variant={
                      slot.doses.some((d) => d.status === "PENDING")
                        ? "primary"
                        : "default"
                    }
                    className="ml-2"
                  >
                    {slot.doses.length}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeSlot && (
            <div className="mt-4">
              {activeSlot.doses.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No medications scheduled for {activeSlot.label.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeSlot.doses.map((dose) => (
                    <MedPassCard
                      key={dose.id}
                      dose={dose}
                      onAdminister={handleAdminister}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Administration Modal */}
      <AdministrationModal
        dose={selectedDose}
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setSelectedDose(null);
        }}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
}
