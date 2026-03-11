export interface Visit {
  id: string;
  client_id: string;
  client_name: string;
  visit_type: string;
  date_of_visit: string | null;
  submitted_date: string | null;
  staff_name: string;
  status: string;
  approved_at: string | null;
}

export interface VisitsResponse {
  visits: Visit[];
  total: number;
  page: number;
  size: number;
}

export interface FetchVisitsParams {
  page?: number;
  size?: number;
  status?: string;
  employee_id?: string;
  client_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface EmployeeOption {
  id: string;
  name: string;
}

export interface ClientOption {
  id: string;
  name: string;
}
