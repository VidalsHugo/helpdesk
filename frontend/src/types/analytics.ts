export interface TicketsByStatusItem {
  status: string;
  total: number;
}

export interface TicketsByStatusResponse {
  start_date: string;
  end_date: string;
  results: TicketsByStatusItem[];
}

export interface AverageResponseTimeResponse {
  start_date: string;
  end_date: string;
  tickets_considered: number;
  tickets_with_first_response: number;
  average_response_seconds: number | null;
  average_response_hours: number | null;
}

export interface TicketsByPeriodItem {
  date: string;
  total: number;
}

export interface TicketsByPeriodResponse {
  start_date: string;
  end_date: string;
  total_tickets: number;
  results: TicketsByPeriodItem[];
}

export interface TicketsByModeratorItem {
  moderator_id: string;
  email: string;
  full_name: string;
  total_assigned: number;
  total_resolved: number;
}

export interface TicketsByModeratorResponse {
  start_date: string;
  end_date: string;
  results: TicketsByModeratorItem[];
}

export interface AverageResolutionTimeResponse {
  start_date: string;
  end_date: string;
  tickets_resolved: number;
  average_resolution_seconds: number | null;
  average_resolution_hours: number | null;
}
