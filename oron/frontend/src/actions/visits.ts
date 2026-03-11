import { API_BASE_URL } from "@/constants";
import { VisitsResponse, FetchVisitsParams, EmployeeOption, ClientOption } from "@/types/VisitsTypes";

export const fetchUserVisits = async (
  token: string,
  params: FetchVisitsParams = {}
): Promise<VisitsResponse> => {
  const { page = 1, size = 10, status, employee_id, client_id, start_date, end_date } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (status) {
    queryParams.append("status", status);
  }

  if (employee_id) {
    queryParams.append("employee_id", employee_id);
  }

  if (client_id) {
    queryParams.append("client_id", client_id);
  }

  if (start_date) {
    queryParams.append("start_date", start_date);
  }

  if (end_date) {
    queryParams.append("end_date", end_date);
  }

  const response = await fetch(
    `${API_BASE_URL}/visit/user/all?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch visits");
  }

  const data = await response.json();
  return data.data;
};

export const fetchEmployeesForFilter = async (token: string): Promise<EmployeeOption[]> => {
  const response = await fetch(
    `${API_BASE_URL}/users/all/users?size=1000&page=1&role=STANDARD`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }

  const data = await response.json();
  return data.data.users.map((user: any) => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.trim(),
  }));
};

export const fetchClientsForFilter = async (token: string): Promise<ClientOption[]> => {
  const response = await fetch(
    `${API_BASE_URL}/events/fetch-all-clients-intake`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch clients");
  }

  const data = await response.json();
  return data.data.map((client: any) => ({
    id: client.id,
    name: `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unknown Client",
  }));
};
