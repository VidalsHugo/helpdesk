import { api } from "@/services/api";
import type {
  CreateTicketPayload,
  PaginatedResponse,
  Ticket,
  TicketEvent,
  TicketMessage,
  TicketStatus,
} from "@/types/tickets";

type TicketListParams = {
  page?: number;
  status?: string;
  priority?: string;
  category?: string;
  assigned_to?: string;
  created_by?: string;
  search?: string;
  ordering?: string;
};

export async function listTickets(params: TicketListParams = {}): Promise<PaginatedResponse<Ticket>> {
  const response = await api.get<PaginatedResponse<Ticket>>("/tickets/", {
    params: { page: 1, ...params },
  });
  return response.data;
}

export async function getTicket(id: string): Promise<Ticket> {
  const response = await api.get<Ticket>(`/tickets/${id}/`);
  return response.data;
}

export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  const response = await api.post<Ticket>("/tickets/", payload);
  return response.data;
}

export async function cancelTicket(id: string): Promise<Ticket> {
  const response = await api.post<Ticket>(`/tickets/${id}/cancel/`);
  return response.data;
}

export async function listTicketEvents(id: string): Promise<TicketEvent[]> {
  const response = await api.get<TicketEvent[]>(`/tickets/${id}/events/`);
  return response.data;
}

export async function listTicketMessages(id: string): Promise<PaginatedResponse<TicketMessage>> {
  const response = await api.get<PaginatedResponse<TicketMessage>>("/tickets/messages/", {
    params: { ticket: id },
  });
  return response.data;
}

export async function addTicketMessage(payload: {
  ticket: string;
  message: string;
  is_internal?: boolean;
}): Promise<TicketMessage> {
  const response = await api.post<TicketMessage>("/tickets/messages/", payload);
  return response.data;
}

export async function assignTicket(id: string, assignedTo: string | null): Promise<Ticket> {
  const response = await api.post<Ticket>(`/tickets/${id}/assign/`, {
    assigned_to: assignedTo,
  });
  return response.data;
}

export async function changeTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  const response = await api.post<Ticket>(`/tickets/${id}/change-status/`, { status });
  return response.data;
}
