export type EmployeeEventType = {
  id: string;
  date: Date;
  start: string;
  end: string;
  staff: string;
  client: string;
  clientId: string;
  notes?: string;
  wasRescheduled: boolean;
  event_approved?: boolean;
  content: {
    start: string;
    end: string;
  };
};
