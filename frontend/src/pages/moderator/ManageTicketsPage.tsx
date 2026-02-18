import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignTicket, listTickets } from "@/services/tickets";
import { useAuthStore } from "@/stores/authStore";
import type { TicketCategory, TicketPriority, TicketStatus } from "@/types/tickets";
import {
  Settings2,
  Search,
  Filter,
  UserCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Tag,
  AlertTriangle,
  FolderOpen,
  Users,
} from "lucide-react";

type AssignedFilter = "ALL" | "MINE" | "UNASSIGNED";

function statusLabel(status: TicketStatus): string {
  const map: Record<TicketStatus, string> = {
    OPEN: "Aberto",
    IN_PROGRESS: "Em andamento",
    WAITING_USER: "Aguardando usuario",
    RESOLVED: "Resolvido",
    CANCELED: "Cancelado",
  };
  return map[status];
}

export default function ManageTicketsPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TicketStatus | "ALL">("ALL");
  const [priority, setPriority] = useState<TicketPriority | "ALL">("ALL");
  const [category, setCategory] = useState<TicketCategory | "ALL">("ALL");
  const [assignedFilter, setAssignedFilter] = useState<AssignedFilter>("ALL");
  const [search, setSearch] = useState("");

  const assignedToParam =
    assignedFilter === "MINE"
      ? user?.id
      : assignedFilter === "UNASSIGNED"
        ? "null"
        : undefined;

  const ticketsQuery = useQuery({
    queryKey: [
      "tickets",
      "manage",
      page,
      status,
      priority,
      category,
      assignedFilter,
      search,
      user?.id,
    ],
    queryFn: () =>
      listTickets({
        page,
        status: status === "ALL" ? undefined : status,
        priority: priority === "ALL" ? undefined : priority,
        category: category === "ALL" ? undefined : category,
        search: search || undefined,
        assigned_to: assignedToParam,
        ordering: "-created_at",
      }),
  });

  const assignToMeMutation = useMutation({
    mutationFn: (ticketId: string) => assignTicket(ticketId, user?.id || null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tickets", "manage"] });
    },
  });

  const tickets = ticketsQuery.data?.results || [];
  const hasNext = Boolean(ticketsQuery.data?.next);
  const hasPrevious = Boolean(ticketsQuery.data?.previous);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
          <Settings2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gerenciar Chamados
          </h1>
          <p className="text-sm text-muted-foreground">
            Atribua, filtre e gerencie todos os chamados.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Filtros avancados
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <div className="space-y-2 lg:col-span-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              Busca
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Titulo ou descricao"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10 transition-colors focus-visible:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              Status
            </Label>
            <Select value={status} onValueChange={(value) => setStatus(value as TicketStatus | "ALL")}>
              <SelectTrigger className="transition-colors focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="OPEN">Aberto</SelectItem>
                <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                <SelectItem value="WAITING_USER">Aguardando usuario</SelectItem>
                <SelectItem value="RESOLVED">Resolvido</SelectItem>
                <SelectItem value="CANCELED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
              Prioridade
            </Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TicketPriority | "ALL")}>
              <SelectTrigger className="transition-colors focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="LOW">Baixa</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="CRITICAL">Critica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
              Categoria
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as TicketCategory | "ALL")}>
              <SelectTrigger className="transition-colors focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="GENERAL">Geral</SelectItem>
                <SelectItem value="TECHNICAL">Tecnico</SelectItem>
                <SelectItem value="BILLING">Financeiro</SelectItem>
                <SelectItem value="ACCESS">Acesso</SelectItem>
                <SelectItem value="BUG">Bug</SelectItem>
                <SelectItem value="FEATURE">Feature</SelectItem>
                <SelectItem value="OTHER">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              Atribuicao
            </Label>
            <Select value={assignedFilter} onValueChange={(value) => setAssignedFilter(value as AssignedFilter)}>
              <SelectTrigger className="transition-colors focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="MINE">Atribuidos a mim</SelectItem>
                <SelectItem value="UNASSIGNED">Nao atribuidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets list */}
      <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
        <CardContent className="space-y-4 pt-6">
          {ticketsQuery.isLoading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Carregando chamados...</p>
            </div>
          )}
          {ticketsQuery.isError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Nao foi possivel carregar os chamados.
            </div>
          )}

          {!ticketsQuery.isLoading && !ticketsQuery.isError && tickets.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Inbox className="h-10 w-10" />
              <p className="text-sm">Nenhum chamado encontrado.</p>
            </div>
          )}

          {!ticketsQuery.isLoading &&
            !ticketsQuery.isError &&
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">{ticket.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline" className="border-border/60">
                      {statusLabel(ticket.status)}
                    </Badge>
                    <span className="text-muted-foreground">Prioridade: {ticket.priority}</span>
                    <span className="text-muted-foreground">Categoria: {ticket.category}</span>
                    <span className="text-muted-foreground">
                      Responsavel: {ticket.assigned_to?.full_name || ticket.assigned_to?.email || "Nao atribuido"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!ticket.assigned_to && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => assignToMeMutation.mutate(ticket.id)}
                      disabled={assignToMeMutation.isPending}
                      className="gap-1.5 border-border/60 transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Assumir
                    </Button>
                  )}
                  <Button asChild size="sm" className="gap-1.5">
                    <Link to={`/chamados/${ticket.id}`}>
                      Abrir
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

          {/* Pagination */}
          {!ticketsQuery.isLoading && !ticketsQuery.isError && (
            <div className="flex items-center justify-between border-t border-border/60 pt-4">
              <p className="text-sm text-muted-foreground">
                Total: <strong className="text-foreground">{ticketsQuery.data?.count || 0}</strong>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={!hasPrevious}
                  className="gap-1 border-border/60"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={!hasNext}
                  className="gap-1 border-border/60"
                >
                  Proxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
