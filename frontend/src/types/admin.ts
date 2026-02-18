import type { AuthUser, UserRole } from "@/types/auth";

export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuthUser[];
}

export interface AdminUserCreatePayload {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  password?: string;
  is_active?: boolean;
}

export interface AdminUserUpdatePayload {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  password?: string;
  is_active?: boolean;
}
