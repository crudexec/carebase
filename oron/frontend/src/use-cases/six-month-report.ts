"use client";

import {
  SixMonthReport,
  GenerateReportRequest,
  ReportListResponse,
  ExportReportResponse
} from '@/types/SixMonthReport';
import { API_BASE_URL } from '@/constants';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };
};

const BASE_URL = `${API_BASE_URL}/six-month-report`;

// Generate a new six-month report
export const generateSixMonthReport = async (data: GenerateReportRequest): Promise<{ report_id: string; status: string; message: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to generate report');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to generate report');
  }
};

// Get all reports with optional filters
export const getAllReports = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  report_type?: string;
  start_date?: string;
  end_date?: string;
  intake_id?: string;
}): Promise<ReportListResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = `${BASE_URL}/all${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to fetch reports');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch reports');
  }
};

// Get reports for a specific treatment plan
export const getReportsByTreatmentPlan = async (
  treatmentPlanId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<ReportListResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = `${BASE_URL}/treatment-plan/${treatmentPlanId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to fetch treatment plan reports');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch treatment plan reports');
  }
};

// Get a single report by ID
export const getReportById = async (reportId: string): Promise<SixMonthReport> => {
  try {
    const response = await fetch(`${BASE_URL}/${reportId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to fetch report');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch report');
  }
};

// Get report generation status
export const getReportStatus = async (reportId: string): Promise<{ id: string; status: string; created_at: string; updated_at: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/${reportId}/status`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to fetch report status');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch report status');
  }
};

// Export report to PDF
export const exportReportToPDF = async (reportId: string): Promise<ExportReportResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${reportId}/export`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to export report');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to export report');
  }
};

// Finalize a report
export const finalizeReport = async (reportId: string, supervisor_comments?: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/${reportId}/finalize`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ supervisor_comments }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to finalize report');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to finalize report');
  }
};

// Delete a report
export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/${reportId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to delete report');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete report');
  }
};

// Poll for report generation status
export const pollReportStatus = async (
  reportId: string,
  onStatusChange: (status: string) => void,
  maxAttempts: number = 30,
  interval: number = 2000
): Promise<void> => {
  let attempts = 0;

  const checkStatus = async () => {
    if (attempts >= maxAttempts) {
      throw new Error('Report generation timeout');
    }

    try {
      const status = await getReportStatus(reportId);
      onStatusChange(status.status);

      if (status.status === 'completed' || status.status === 'failed') {
        return;
      }

      attempts++;
      setTimeout(checkStatus, interval);
    } catch (error) {
      throw error;
    }
  };

  await checkStatus();
};
