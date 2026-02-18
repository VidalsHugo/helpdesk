import { api } from "@/services/api";
import type {
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
  UserListResponse,
} from "@/types/admin";
import type { AuthUser } from "@/types/auth";

type ListUsersParams = {
  page?: number;
  search?: string;
  role?: string;
  is_active?: string;
};

export async function listAdminUsers(params: ListUsersParams = {}): Promise<UserListResponse> {
  const response = await api.get<UserListResponse>("/auth/users/", {
    params: { page: 1, ...params },
  });
  return response.data;
}

export async function createAdminUser(payload: AdminUserCreatePayload): Promise<AuthUser> {
  const response = await api.post<AuthUser>("/auth/users/", payload);
  return response.data;
}

export async function updateAdminUser(id: string, payload: AdminUserUpdatePayload): Promise<AuthUser> {
  const response = await api.patch<AuthUser>(`/auth/users/${id}/`, payload);
  return response.data;
}

export async function deactivateAdminUser(id: string): Promise<void> {
  await api.delete(`/auth/users/${id}/`);
}
