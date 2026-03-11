'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { CalendarIcon, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  generateSixMonthReport,
  pollReportStatus
} from '@/use-cases/six-month-report';
import {
  TreatmentPlanType,
  ReportPeriod,
  GenerateReportRequest
} from '@/types/SixMonthReport';
import { retrievFullIntakeForm } from '@/use-cases/new-intake';
import { retrieveClientTreatmentPlan } from '@/use-cases/clients';
import useLocalStorage from '@/hooks/useLocalStorage';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedClientId?: string;
}

interface AvailablePlan {
  type: TreatmentPlanType;
  label: string;
  id: string | null;
  available: boolean;
}

const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedClientId,
}) => {
  const { toast } = useToast();
  const { storedValue: token } = useLocalStorage<string>('token');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  // Form states
  const [selectedClientId, setSelectedClientId] = useState(preSelectedClientId || '');
  const [selectedPlan, setSelectedPlan] = useState<AvailablePlan | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.CUSTOM);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  // Fetch all clients
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['all-clients-for-report'],
    queryFn: async () => {
      if (!token) return null;
      return await retrievFullIntakeForm(token as string);
    },
    enabled: !!token,
  });

  // Get active clients with names
  const clients = clientsData?.data?.filter(client =>
    client.status === 'active' &&
    client.clientInformation?.first_name
  ).map(client => ({
    id: client.id,
    name: `${client.clientInformation?.first_name || ''} ${client.clientInformation?.last_name || ''}`.trim(),
  })) || [];

  // Fetch all treatment plans for selected client
  useEffect(() => {
    const fetchAllPlans = async () => {
      if (!token || !selectedClientId) {
        setAvailablePlans([]);
        return;
      }

      setIsLoadingPlans(true);
      const planTypes = [
        { type: TreatmentPlanType.IISS_ASSESSMENT, label: 'IISS Assessment' },
        { type: TreatmentPlanType.FC_ASSESSMENT, label: 'FC Assessment' },
        { type: TreatmentPlanType.ITI_ASSESSMENT, label: 'ITI Assessment' },
      ];

      const results: AvailablePlan[] = await Promise.all(
        planTypes.map(async ({ type, label }) => {
          try {
            const result = await retrieveClientTreatmentPlan(
              token as string,
              selectedClientId,
              type as any
            );
            // API returns { data: { treatmentPlans: [...] } }
            const treatmentPlan = result?.data?.treatmentPlans?.[0];
            return {
              type,
              label,
              id: treatmentPlan?.id || null,
              available: !!treatmentPlan?.id,
            };
          } catch (error) {
            return {
              type,
              label,
              id: null,
              available: false,
            };
          }
        })
      );

      setAvailablePlans(results);
      setIsLoadingPlans(false);

      // Auto-select first available plan
      const firstAvailable = results.find(p => p.available);
      if (firstAvailable) {
        setSelectedPlan(firstAvailable);
      } else {
        setSelectedPlan(null);
      }
    };

    fetchAllPlans();
  }, [token, selectedClientId]);

  // Reset when client changes
  useEffect(() => {
    setSelectedPlan(null);
    setAvailablePlans([]);
  }, [selectedClientId]);

  // Quick period selection
  const handlePeriodSelection = (selectedPeriod: ReportPeriod) => {
    setPeriod(selectedPeriod);
    const today = new Date();

    switch (selectedPeriod) {
      case ReportPeriod.FIRST_SIX_MONTHS:
        setStartDate(subMonths(today, 6));
        setEndDate(today);
        break;
      case ReportPeriod.SECOND_SIX_MONTHS:
        setStartDate(subMonths(today, 12));
        setEndDate(subMonths(today, 6));
        break;
      case ReportPeriod.CUSTOM:
        break;
    }
  };

  const handleGenerate = async () => {
    if (!selectedClientId) {
      toast({
        title: 'Error',
        description: 'Please select a client',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedPlan || !selectedPlan.id) {
      toast({
        title: 'Error',
        description: 'Please select a treatment plan',
        variant: 'destructive',
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Please select date range',
        variant: 'destructive',
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: 'Error',
        description: 'Start date must be before end date',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Initiating report generation...');

    try {
      const requestData: GenerateReportRequest = {
        treatment_plan_id: selectedPlan.id,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        report_type: selectedPlan.type,
        period: period,
      };

      const response = await generateSixMonthReport(requestData);

      setGenerationStatus('Report generation started. Processing data...');

      await pollReportStatus(
        response.report_id,
        (status) => {
          const statusMessages: Record<string, string> = {
            'generating': 'Generating report... This may take a few moments.',
            'completed': 'Report generated successfully!',
            'failed': 'Report generation failed.',
          };
          setGenerationStatus(statusMessages[status] || status);
        }
      );

      toast({
        title: 'Success',
        description: 'Report generated successfully',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const selectedClientName = clients.find(c => c.id === selectedClientId)?.name || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Generate Six-Month Report</DialogTitle>
          <DialogDescription>
            Create a comprehensive summary report for a client&apos;s treatment progress.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Client Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client" className="text-right">
              Client
            </Label>
            <Select
              value={selectedClientId}
              onValueChange={setSelectedClientId}
              disabled={!!preSelectedClientId}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select a client"} />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Available Treatment Plans */}
          {selectedClientId && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Treatment Plans
              </Label>
              <div className="col-span-3 space-y-2">
                {isLoadingPlans ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading available plans...
                  </div>
                ) : availablePlans.length > 0 ? (
                  <>
                    {availablePlans.map((plan) => (
                      <div
                        key={plan.type}
                        onClick={() => plan.available && setSelectedPlan(plan)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                          plan.available
                            ? selectedPlan?.type === plan.type
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {plan.available ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={cn(
                            "font-medium",
                            !plan.available && "text-gray-400"
                          )}>
                            {plan.label}
                          </span>
                        </div>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded",
                          plan.available
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        )}>
                          {plan.available ? 'Available' : 'No Plan'}
                        </span>
                      </div>
                    ))}
                    {!availablePlans.some(p => p.available) && (
                      <p className="text-sm text-red-500 mt-2">
                        No treatment plans found for this client. Please create a treatment plan first.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a client to see available treatment plans
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Period Selection - Only show if plan is selected */}
          {selectedPlan && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="period" className="text-right">
                  Period
                </Label>
                <Select
                  value={period}
                  onValueChange={(value) => handlePeriodSelection(value as ReportPeriod)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value={ReportPeriod.FIRST_SIX_MONTHS}>
                      Last 6 Months
                    </SelectItem>
                    <SelectItem value={ReportPeriod.SECOND_SIX_MONTHS}>
                      Previous 6 Months (6-12 months ago)
                    </SelectItem>
                    <SelectItem value={ReportPeriod.CUSTOM}>
                      Custom Date Range
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">
                  Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-date" className="text-right">
                  End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          {/* Generation Status */}
          {generationStatus && (
            <div className="col-span-4 mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                {generationStatus}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedClientId || !selectedPlan?.id || !startDate || !endDate}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateReportModal;
