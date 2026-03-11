import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  generateSixMonthReport,
  getAllReports,
  getReportsByTreatmentPlan,
  getReportById,
  getReportStatus,
  exportReportToPDF,
  finalizeReport,
  deleteReport,
  pollReportStatus,
} from '@/use-cases/six-month-report';
import { 
  SixMonthReport, 
  GenerateReportRequest,
  ReportStatus 
} from '@/types/SixMonthReport';

export const useSixMonthReports = (filters?: {
  page?: number;
  limit?: number;
  status?: string;
  report_type?: string;
  start_date?: string;
  end_date?: string;
  intake_id?: string;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all reports
  const reportsQuery = useQuery({
    queryKey: ['six-month-reports', filters],
    queryFn: () => getAllReports(filters),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache (previously cacheTime)
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: generateSixMonthReport,
    onSuccess: async (data) => {
      toast({
        title: 'Report Generation Started',
        description: 'Your report is being generated. This may take a few moments.',
      });
      
      // Start polling for status
      try {
        await pollReportStatus(
          data.report_id,
          (status) => {
            if (status === ReportStatus.COMPLETED) {
              toast({
                title: 'Report Generated',
                description: 'Your report has been generated successfully.',
              });
              queryClient.invalidateQueries({ queryKey: ['six-month-reports'] });
            } else if (status === ReportStatus.FAILED) {
              toast({
                title: 'Generation Failed',
                description: 'Failed to generate the report. Please try again.',
                variant: 'destructive',
              });
            }
          }
        );
      } catch (error) {
        console.error('Polling error:', error);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate report',
        variant: 'destructive',
      });
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      toast({
        title: 'Report Deleted',
        description: 'The report has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['six-month-reports'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete report',
        variant: 'destructive',
      });
    },
  });

  // Finalize report mutation
  const finalizeReportMutation = useMutation({
    mutationFn: ({ reportId, comments }: { reportId: string; comments?: string }) =>
      finalizeReport(reportId, comments),
    onSuccess: () => {
      toast({
        title: 'Report Finalized',
        description: 'The report has been finalized successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['six-month-reports'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to finalize report',
        variant: 'destructive',
      });
    },
  });

  return {
    reports: reportsQuery.data?.reports || [],
    pagination: reportsQuery.data?.pagination,
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
    refetch: reportsQuery.refetch,
    generateReport: generateReportMutation.mutate,
    deleteReport: deleteReportMutation.mutate,
    finalizeReport: finalizeReportMutation.mutate,
    isGenerating: generateReportMutation.isPending,
    isDeleting: deleteReportMutation.isPending,
    isFinalizing: finalizeReportMutation.isPending,
  };
};

export const useSingleReport = (reportId: string) => {
  const queryClient = useQueryClient();

  const reportQuery = useQuery({
    queryKey: ['six-month-report', reportId],
    queryFn: () => getReportById(reportId),
    enabled: !!reportId,
  });

  const exportMutation = useMutation({
    mutationFn: () => exportReportToPDF(reportId),
    onSuccess: (data) => {
      // Handle PDF export success
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    onError: (error: any) => {
      console.error('Export failed:', error);
    },
  });

  return {
    report: reportQuery.data,
    isLoading: reportQuery.isLoading,
    error: reportQuery.error,
    refetch: reportQuery.refetch,
    exportPDF: exportMutation.mutate,
    isExporting: exportMutation.isPending,
  };
};

export const useReportsByTreatmentPlan = (
  treatmentPlanId: string,
  filters?: {
    page?: number;
    limit?: number;
    status?: string;
  }
) => {
  const reportsQuery = useQuery({
    queryKey: ['treatment-plan-reports', treatmentPlanId, filters],
    queryFn: () => getReportsByTreatmentPlan(treatmentPlanId, filters),
    enabled: !!treatmentPlanId,
  });

  return {
    reports: reportsQuery.data?.reports || [],
    pagination: reportsQuery.data?.pagination,
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
    refetch: reportsQuery.refetch,
  };
};

// Hook for auto-refreshing reports that are generating
export const useAutoRefreshReports = (reports: SixMonthReport[], onRefresh: () => void) => {
  useEffect(() => {
    const hasGeneratingReports = reports.some(
      report => report.status === ReportStatus.GENERATING
    );

    if (hasGeneratingReports) {
      const interval = setInterval(() => {
        onRefresh();
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [reports, onRefresh]);
};