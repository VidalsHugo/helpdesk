import type { AuthUser } from "@/types/auth";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_USER" | "RESOLVED" | "CANCELED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketCategory =
  | "GENERAL"
  | "TECHNICAL"
  | "BILLING"
  | "ACCESS"
  | "BUG"
  | "FEATURE"
  | "OTHER";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  created_by: AuthUser;
  assigned_to: AuthUser | null;
  canceled_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketEvent {
  id: string;
  event_type: string;
  from_value: string;
  to_value: string;
  triggered_by: AuthUser;
  created_at: string;
}

export interface TicketMessage {
  id: string;
  ticket: string;
  author: AuthUser;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
}
