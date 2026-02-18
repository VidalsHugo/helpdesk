import { api } from "@/services/api";
import type {
  AverageResolutionTimeResponse,
  AverageResponseTimeResponse,
  TicketsByModeratorResponse,
  TicketsByPeriodResponse,
  TicketsByStatusResponse,
} from "@/types/analytics";

type DateRangeParams = {
  startDate?: string;
  endDate?: string;
};

function toQueryParams(params?: DateRangeParams): Record<string, string> | undefined {
  if (!params?.startDate && !params?.endDate) return undefined;
  return {
    ...(params.startDate ? { start_date: params.startDate } : {}),
    ...(params.endDate ? { end_date: params.endDate } : {}),
  };
}

export async function getTicketsByStatus(params?: DateRangeParams): Promise<TicketsByStatusResponse> {
  const response = await api.get<TicketsByStatusResponse>("/analytics/tickets-by-status/", {
    params: toQueryParams(params),
  });
  return response.data;
}

export async function getAverageResponseTime(): Promise<AverageResponseTimeResponse> {
  const response = await api.get<AverageResponseTimeResponse>("/analytics/average-response-time/");
  return response.data;
}

export async function getTicketsByPeriod(params?: DateRangeParams): Promise<TicketsByPeriodResponse> {
  const response = await api.get<TicketsByPeriodResponse>("/analytics/tickets-by-period/", {
    params: toQueryParams(params),
  });
  return response.data;
}

export async function getTicketsByModerator(params?: DateRangeParams): Promise<TicketsByModeratorResponse> {
  const response = await api.get<TicketsByModeratorResponse>("/analytics/tickets-by-moderator/", {
    params: toQueryParams(params),
  });
  return response.data;
}

export async function getAverageResolutionTime(params?: DateRangeParams): Promise<AverageResolutionTimeResponse> {
  const response = await api.get<AverageResolutionTimeResponse>("/analytics/average-resolution-time/", {
    params: toQueryParams(params),
  });
  return response.data;
}
