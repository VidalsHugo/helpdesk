import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listTickets } from "@/services/tickets";
import type { Ticket, TicketStatus } from "@/types/tickets";
import {
  ClipboardList,
  PlusCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Inbox,
} from "lucide-react";

const STATUS_OPTIONS: Array<{ label: string; value: TicketStatus | "ALL" }> = [
  { label: "Todos", value: "ALL" },
  { label: "Aberto", value: "OPEN" },
  { label: "Em andamento", value: "IN_PROGRESS" },
  { label: "Aguardando usuario", value: "WAITING_USER" },
  { label: "Resolvido", value: "RESOLVED" },
  { label: "Cancelado", value: "CANCELED" },
];

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

function statusBadgeVariant(status: TicketStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "OPEN") return "default";
  if (status === "RESOLVED") return "secondary";
  if (status === "CANCELED") return "destructive";
  return "outline";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export default function MyTicketsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tickets", "list", page],
    queryFn: () => listTickets({ page }),
  });

  const filteredTickets = useMemo(() => {
    const items = data?.results || [];
    return items.filter((ticket: Ticket) => {
      const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        ticket.title.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [data?.results, search, statusFilter]);

  const hasNext = Boolean(data?.next);
  const hasPrevious = Boolean(data?.previous);

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Meus Chamados
            </h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe e gerencie seus chamados.
            </p>
          </div>
        </div>
        <Button asChild className="gap-2 shadow-md shadow-primary/20">
          <Link to="/meus-chamados/novo">
            <PlusCircle className="h-4 w-4" />
            Novo chamado
          </Link>
        </Button>
      </header>

      {/* Filters */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium text-foreground">
              Buscar
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Titulo ou descricao"
                className="pl-10 transition-colors focus-visible:border-primary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as TicketStatus | "ALL")}
            >
              <SelectTrigger className="transition-colors focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets table */}
      <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
        <CardContent className="pt-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Carregando chamados...</p>
            </div>
          )}
          {isError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Nao foi possivel carregar seus chamados.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                      <TableHead className="font-semibold text-foreground">Titulo</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Prioridade</TableHead>
                      <TableHead className="font-semibold text-foreground">Atualizado em</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Acao</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Inbox className="h-8 w-8" />
                            <p className="text-sm">Nenhum chamado encontrado para os filtros atuais.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="border-border/60 transition-colors hover:bg-accent/50">
                        <TableCell className="font-medium text-foreground">{ticket.title}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(ticket.status)}>
                            {statusLabel(ticket.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{ticket.priority}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(ticket.updated_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm" className="gap-1.5 border-border/60 transition-colors hover:border-primary/30 hover:text-primary">
                            <Link to={`/chamados/${ticket.id}`}>
                              Detalhes
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                <p className="text-sm text-muted-foreground">
                  Total de chamados: <strong className="text-foreground">{data?.count || 0}</strong>
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
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
