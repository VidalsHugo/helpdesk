import { Menu, User } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

import NotificationBell from "@/components/NotificationBell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/auth";

type NavItem = {
  label: string;
  to: string;
  roles: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/home", roles: ["USER", "MODERATOR", "ADMIN"] },
  { label: "Info Empresa", to: "/info", roles: ["USER", "MODERATOR", "ADMIN"] },
  { label: "Meus Chamados", to: "/meus-chamados", roles: ["USER", "MODERATOR", "ADMIN"] },
  { label: "Novo Chamado", to: "/meus-chamados/novo", roles: ["USER", "MODERATOR", "ADMIN"] },
  { label: "Dashboard Moderador", to: "/dashboard", roles: ["MODERATOR", "ADMIN"] },
  { label: "Gerenciar Chamados", to: "/chamados", roles: ["MODERATOR", "ADMIN"] },
  { label: "Dashboard Admin", to: "/admin/dashboard", roles: ["ADMIN"] },
  { label: "Usuarios", to: "/admin/usuarios", roles: ["ADMIN"] },
  { label: "Configuracoes", to: "/admin/configuracoes", roles: ["ADMIN"] },
];

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) {
    return "U";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function renderNav(items: NavItem[]) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `rounded-md px-3 py-2 text-sm transition-colors ${
              isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return null;
  }

  const allowedItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const displayName = user.full_name || user.email;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>HelpDesk</SheetTitle>
                </SheetHeader>
                <div className="mt-4">{renderNav(allowedItems)}</div>
              </SheetContent>
            </Sheet>
            <Link to="/home" className="text-lg font-semibold text-slate-900">
              HelpDesk
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm md:inline">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void logout()}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-lg border bg-white p-3 md:block">{renderNav(allowedItems)}</aside>
        <main className="rounded-lg border bg-white p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
