'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SixMonthReport, ReportStatus } from '@/types/SixMonthReport';
import { useSixMonthReports } from '@/hooks/useSixMonthReport';
import GenerateReportModal from './GenerateReportModal';
import ReportViewer from './ReportViewer';
import { useQuery } from '@tanstack/react-query';
import { retrievFullIntakeForm } from '@/use-cases/new-intake';
import useLocalStorage from '@/hooks/useLocalStorage';
import { exportReportToPDF } from '@/use-cases/six-month-report';
import { useToast } from '@/components/ui/use-toast';

const ReportDashboard = () => {
  const { storedValue: token } = useLocalStorage<string>('token');
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<SixMonthReport | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [clientFilter, setClientFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all clients for filter dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['all-clients-for-filter'],
    queryFn: async () => {
      if (!token) return null;
      return await retrievFullIntakeForm(token as string);
    },
    enabled: !!token,
  });

  // Get clients list for filter
  const clientsList = clientsData?.data?.filter(client =>
    client.clientInformation?.first_name
  ).map(client => ({
    id: client.id,
    name: `${client.clientInformation?.first_name || ''} ${client.clientInformation?.last_name || ''}`.trim(),
  })) || [];

  // Helper to get client name from intake
  const getClientName = (report: SixMonthReport) => {
    if (report.intake?.clientInformation) {
      const { first_name, last_name } = report.intake.clientInformation;
      return `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown Client';
    }
    return 'Unknown Client';
  };

  // Use our custom hook
  const {
    reports,
    pagination,
    isLoading,
    error,
    refetch,
    deleteReport: deleteReportMutation,
    isDeleting,
  } = useSixMonthReports({
    page: currentPage,
    limit: 10,
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
    report_type: typeFilter && typeFilter !== 'all' ? typeFilter : undefined,
  });

  const getStatusBadge = (status: ReportStatus) => {
    const variants: Record<ReportStatus, 'default' | 'secondary' | 'success' | 'destructive'> = {
      [ReportStatus.DRAFT]: 'secondary',
      [ReportStatus.GENERATING]: 'default',
      [ReportStatus.COMPLETED]: 'success',
      [ReportStatus.FAILED]: 'destructive',
    };

    const labels: Record<ReportStatus, string> = {
      [ReportStatus.DRAFT]: 'Draft',
      [ReportStatus.GENERATING]: 'Generating...',
      [ReportStatus.COMPLETED]: 'Completed',
      [ReportStatus.FAILED]: 'Failed',
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getReportTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      'IISS_Assessment': 'IISS',
      'FC_Assessment': 'FC',
      'ITI_Assessment': 'ITI',
    };

    return (
      <Badge variant="outline">
        {typeLabels[type] || type}
      </Badge>
    );
  };

  const handleViewReport = (report: SixMonthReport) => {
    setSelectedReport(report);
    setShowViewer(true);
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;

    deleteReportMutation(reportToDelete);
    setShowDeleteDialog(false);
    setReportToDelete(null);
  };

  const confirmDelete = (reportId: string) => {
    setReportToDelete(reportId);
    setShowDeleteDialog(true);
  };

  const handleExportReport = async (reportId: string) => {
    setIsExporting(true);
    try {
      const exportData = await exportReportToPDF(reportId);

      // Open HTML content in new window for printing/saving as PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(exportData.html);
        printWindow.document.close();

        // Wait for content to load, then trigger print dialog
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      } else {
        toast({
          title: 'Error',
          description: 'Please allow pop-ups to export the report',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Auto-refresh for generating reports
  useEffect(() => {
    const hasGeneratingReports = reports?.some(
      report => report.status === ReportStatus.GENERATING
    );

    if (hasGeneratingReports) {
      const interval = setInterval(() => {
        refetch();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [reports, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading reports. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Six-Month Summary Reports</CardTitle>
              <CardDescription>
                Generate and manage comprehensive treatment summary reports
              </CardDescription>
            </div>
            <Button onClick={() => setShowGenerateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="IISS_Assessment">IISS</SelectItem>
                <SelectItem value="FC_Assessment">FC</SelectItem>
                <SelectItem value="ITI_Assessment">ITI</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clientsList.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Reports Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">No reports found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Click &quot;Generate Report&quot; to create your first report
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports
                    ?.filter(report => {
                      // Client filter
                      if (clientFilter && clientFilter !== 'all') {
                        return report.intake_id === clientFilter;
                      }
                      return true;
                    })
                    .map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="font-medium">{getClientName(report)}</div>
                      </TableCell>
                      <TableCell>
                        {getReportTypeBadge(report.report_type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(report.start_date), 'MMM d, yyyy')}</div>
                          <div className="text-gray-500">
                            to {format(new Date(report.end_date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        {report.generatedBy ? 
                          `${report.generatedBy.firstName} ${report.generatedBy.lastName}` : 
                          'Unknown'
                        }
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {report.status === ReportStatus.COMPLETED && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewReport(report)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleExportReport(report.id)}
                                disabled={isExporting}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {!report.is_final && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => confirmDelete(report.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total} reports
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showGenerateModal && (
        <GenerateReportModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onSuccess={() => {
            refetch();
            setShowGenerateModal(false);
          }}
        />
      )}

      {showViewer && selectedReport && (
        <ReportViewer
          report={selectedReport}
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false);
            setSelectedReport(null);
          }}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReportDashboard;