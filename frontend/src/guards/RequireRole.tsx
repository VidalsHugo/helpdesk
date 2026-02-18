import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/auth";

type RequireRoleProps = {
  roles: UserRole[];
};

export function RequireRole({ roles }: RequireRoleProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
