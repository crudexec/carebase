export type Event = {
  id: string;
  date: Date;
  start: string;
  end: string;
  staff: string;
  client: string;
  notes?: string;
  content: {
    start: string;
    end: string;
  };
  original: {
    start: string;
    end: string;
    clientId: string;
    staffId: string;
    was_rescheduled: boolean;
    from_treatment_plan?: boolean;
    event_approved?: boolean;
  };
};

export type Request = {
  id: number;
  staffName: string;
  clientName: string;
  currentAppointment: string;
  requestedNewTime: string;
  reason: string;
};

export type RequestType = {
  requestId: string;
  eventId: string;
  staffName: string;
  clientName: string;
  currentEventDate: Date;
  currentEventTime: string;
  proposedEventDate: Date;
  proposedEventTime: string;
  proposedEventEndTime: string;
  reason: string;
};

export type DraftEvent = {
  id: string;
  date: Date;
  start: string;
  end: string;
  staff: string;
  client: string;
  notes?: string;
  content: {
    start: string;
    end: string;
  };
};

export type FormErrors = {
  [key: string]: string;
};
