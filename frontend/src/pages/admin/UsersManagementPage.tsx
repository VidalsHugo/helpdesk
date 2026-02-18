import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createAdminUser, deactivateAdminUser, listAdminUsers, updateAdminUser } from "@/services/adminUsers";
import type { UserRole } from "@/types/auth";
import {
  Users,
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  Search,
  Filter,
  UserX,
  Inbox,
} from "lucide-react";

export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [isActiveFilter, setIsActiveFilter] = useState<"ALL" | "true" | "false">("ALL");

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [password, setPassword] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin", "users", search, roleFilter, isActiveFilter],
    queryFn: () =>
      listAdminUsers({
        search: search || undefined,
        role: roleFilter === "ALL" ? undefined : roleFilter,
        is_active: isActiveFilter === "ALL" ? undefined : isActiveFilter,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: async () => {
      setEmail("");
      setFirstName("");
      setLastName("");
      setRole("USER");
      setPassword("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: ({ id, nextRole }: { id: string; nextRole: UserRole }) =>
      updateAdminUser(id, { role: nextRole }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      password: password || undefined,
      is_active: true,
    });
  }

  function roleBadgeColor(userRole: string) {
    if (userRole === "ADMIN") return "bg-primary/10 text-primary border-primary/20";
    if (userRole === "MODERATOR") return "bg-chart-2/10 text-chart-2 border-chart-2/20";
    return "bg-secondary text-secondary-foreground border-border/60";
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestao de Usuarios
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie, edite e gerencie as contas do sistema.
          </p>
        </div>
      </div>

      {/* Create user */}
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <UserPlus className="h-5 w-5 text-primary" />
            Criar novo usuario
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Preencha os dados para adicionar um novo usuario ao sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleCreateUser}>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="pl-10 transition-colors focus-visible:border-primary"
                  placeholder="usuario@empresa.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                Senha (opcional)
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Se vazio, conta sem senha utilizavel"
                  className="pl-10 transition-colors focus-visible:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Nome
              </Label>
              <Input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Nome"
                className="transition-colors focus-visible:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Sobrenome
              </Label>
              <Input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Sobrenome"
                className="transition-colors focus-visible:border-primary"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                Role
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="max-w-xs transition-colors focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="MODERATOR">MODERATOR</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="gap-2 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
              >
                <UserPlus className="h-4 w-4" />
                {createMutation.isPending ? "Criando..." : "Criar usuario"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users list */}
      <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Usuarios cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Filters */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por email/nome"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10 transition-colors focus-visible:border-primary"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "ALL")}>
              <SelectTrigger className="transition-colors focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os roles</SelectItem>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="MODERATOR">MODERATOR</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
            <Select value={isActiveFilter} onValueChange={(value) => setIsActiveFilter(value as "ALL" | "true" | "false")}>
              <SelectTrigger className="transition-colors focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Ativos e inativos</SelectItem>
                <SelectItem value="true">Somente ativos</SelectItem>
                <SelectItem value="false">Somente inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-border/60" />

          {usersQuery.isLoading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Carregando usuarios...</p>
            </div>
          )}
          {usersQuery.isError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Falha ao carregar usuarios.
            </div>
          )}

          {!usersQuery.isLoading && !usersQuery.isError && (usersQuery.data?.results || []).length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Inbox className="h-8 w-8" />
              <p className="text-sm">Nenhum usuario encontrado.</p>
            </div>
          )}

          {(usersQuery.data?.results || []).map((item) => (
            <div
              key={item.id}
              className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold uppercase text-accent-foreground">
                  {(item.full_name || item.email).charAt(0)}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{item.full_name || item.email}</p>
                  <p className="text-muted-foreground">{item.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${roleBadgeColor(item.role)}`}>
                      {item.role}
                    </Badge>
                    <Badge
                      variant={item.is_active ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {item.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={item.role}
                  onValueChange={(value) =>
                    promoteMutation.mutate({ id: item.id, nextRole: value as UserRole })
                  }
                >
                  <SelectTrigger className="w-40 border-border/60 transition-colors focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="MODERATOR">MODERATOR</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
                {item.is_active && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deactivateMutation.mutate(item.id)}
                    disabled={deactivateMutation.isPending}
                    className="gap-1.5"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    Desativar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
