export type UserRole = "USER" | "MODERATOR" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}
