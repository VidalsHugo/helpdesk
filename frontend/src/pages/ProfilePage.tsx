import {
  Card,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import { Mail, Shield, User } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <section className="space-y-8">
      {/* Page heading */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Perfil
        </h1>
        <p className="text-muted-foreground">
          Visualize e gerencie suas informacoes pessoais.
        </p>
      </div>

      {/* Profile card */}
      <Card className="overflow-hidden border-border/60">
        {/* Top banner strip */}
        <div className="h-24 bg-primary/10" />

        <div className="relative px-6 pb-6">
          {/* Avatar overlapping the banner */}
          <div className="-mt-12 mb-6">
            <Avatar className="h-20 w-20 border-4 border-card text-lg shadow-lg">
              <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User name and role */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              {user?.full_name || "-"}
            </h2>
            <Badge
              variant="secondary"
              className="font-medium capitalize"
            >
              {user?.role || "-"}
            </Badge>
          </div>

          <Separator className="mb-6" />

          {/* Info fields */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nome completo
                </p>
                <p className="mt-0.5 truncate font-medium text-foreground">
                  {user?.full_name || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </p>
                <p className="mt-0.5 truncate font-medium text-foreground">
                  {user?.email || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Shield className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Funcao
                </p>
                <p className="mt-0.5 truncate font-medium capitalize text-foreground">
                  {user?.role || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
