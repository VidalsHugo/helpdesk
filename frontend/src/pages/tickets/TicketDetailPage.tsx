import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/authStore";
import {
  addTicketMessage,
  assignTicket,
  cancelTicket,
  changeTicketStatus,
  getTicket,
  listTicketEvents,
  listTicketMessages,
} from "@/services/tickets";
import type { TicketEvent, TicketMessage, TicketStatus } from "@/types/tickets";
import {
  FileText,
  Calendar,
  Tag,
  AlertTriangle,
  FolderOpen,
  UserCircle,
  XCircle,
  Shield,
  UserCheck,
  RefreshCw,
  Send,
  MessageSquare,
  AlertCircle,
  Activity,
  Clock,
  Eye,
} from "lucide-react";

type TimelineItem =
  | { kind: "event"; id: string; created_at: string; payload: TicketEvent }
  | { kind: "message"; id: string; created_at: string; payload: TicketMessage };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

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

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = useMemo(() => {
    const rawId = params.id;
    if (!rawId || rawId === "undefined" || rawId === "null") return "";
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(rawId) ? rawId : "";
  }, [params.id]);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState<string | null>(null);
  const [statusToUpdate, setStatusToUpdate] = useState<TicketStatus>("OPEN");
  const [isInternalMessage, setIsInternalMessage] = useState(false);

  const ticketQuery = useQuery({
    queryKey: ["ticket", "detail", ticketId],
    queryFn: () => getTicket(ticketId),
    enabled: Boolean(ticketId),
  });

  const eventsQuery = useQuery({
    queryKey: ["ticket", "events", ticketId],
    queryFn: () => listTicketEvents(ticketId),
    enabled: Boolean(ticketId),
  });

  const messagesQuery = useQuery({
    queryKey: ["ticket", "messages", ticketId],
    queryFn: () => listTicketMessages(ticketId),
    enabled: Boolean(ticketId),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelTicket(ticketId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ticket", "detail", ticketId] }),
        queryClient.invalidateQueries({ queryKey: ["ticket", "events", ticketId] }),
        queryClient.invalidateQueries({ queryKey: ["tickets", "list"] }),
      ]);
    },
  });

  const assignToMeMutation = useMutation({
    mutationFn: () => assignTicket(ticketId, user?.id || null),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ticket", "detail", ticketId] }),
        queryClient.invalidateQueries({ queryKey: ["ticket", "events", ticketId] }),
        queryClient.invalidateQueries({ queryKey: ["tickets", "manage"] }),
      ]);
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: () => changeTicketStatus(ticketId, statusToUpdate),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ticket", "detail", ticketId] }),
        queryClient.invalidateQueries({ queryKey: ["ticket", "events", ticketId] }),
        queryClient.invalidateQueries({ queryKey: ["tickets", "manage"] }),
      ]);
    },
  });

  const addMessageMutation = useMutation({
    mutationFn: () =>
      addTicketMessage({
        ticket: ticketId,
        message: message,
        is_internal: isInternalMessage,
      }),
    onSuccess: async () => {
      setMessage("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ticket", "messages", ticketId] }),
        queryClient.invalidateQueries({ queryKey: ["ticket", "events", ticketId] }),
      ]);
    },
    onError: () => {
      setMessageError("Nao foi possivel enviar a mensagem.");
    },
  });

  const timeline = useMemo(() => {
    const eventItems: TimelineItem[] = (eventsQuery.data || []).map((event) => ({
      kind: "event",
      id: event.id,
      created_at: event.created_at,
      payload: event,
    }));
    const messageItems: TimelineItem[] = (messagesQuery.data?.results || []).map((msg) => ({
      kind: "message",
      id: msg.id,
      created_at: msg.created_at,
      payload: msg,
    }));
    return [...eventItems, ...messageItems].sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    );
  }, [eventsQuery.data, messagesQuery.data?.results]);

  useEffect(() => {
    if (ticketQuery.data?.status) {
      setStatusToUpdate(ticketQuery.data.status);
    }
  }, [ticketQuery.data?.status]);

  if (!ticketId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-destructive">Ticket invalido.</p>
      </div>
    );
  }

  if (ticketQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Carregando ticket...</p>
      </div>
    );
  }

  if (ticketQuery.isError || !ticketQuery.data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          Nao foi possivel carregar o ticket.
        </div>
      </div>
    );
  }

  const ticket = ticketQuery.data;
  const canCancel = ticket.status === "OPEN" && ticket.created_by.id === user?.id;
  const isModeratorMode = Boolean(user?.role === "MODERATOR" || user?.role === "ADMIN");

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) {
      setMessageError("Mensagem nao pode ser vazia.");
      return;
    }
    setMessageError(null);
    addMessageMutation.mutate();
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {ticket.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Criado em {formatDate(ticket.created_at)}
          </div>
        </div>
        <Badge
          variant={statusBadgeVariant(ticket.status)}
          className="px-3 py-1 text-sm"
        >
          {statusLabel(ticket.status)}
        </Badge>
      </header>

      {/* Details */}
      <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground">Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground">
            {ticket.description}
          </p>
          <Separator className="bg-border/60" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 text-sm">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Categoria:</span>
              <span className="font-medium text-foreground">{ticket.category}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Prioridade:</span>
              <span className="font-medium text-foreground">{ticket.priority}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Responsavel:</span>
              <span className="font-medium text-foreground">
                {ticket.assigned_to?.full_name || "Nao atribuido"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={statusBadgeVariant(ticket.status)} className="text-xs">
                {statusLabel(ticket.status)}
              </Badge>
            </div>
          </div>

          {canCancel && (
            <>
              <Separator className="bg-border/60" />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                {cancelMutation.isPending ? "Cancelando..." : "Cancelar chamado"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Moderation */}
      {isModeratorMode && (
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              Acoes de moderacao
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Gerencie atribuicao e status deste chamado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => assignToMeMutation.mutate()}
              disabled={assignToMeMutation.isPending}
              className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            >
              <UserCheck className="h-4 w-4" />
              {assignToMeMutation.isPending ? "Atribuindo..." : "Assumir chamado"}
            </Button>

            <div className="grid gap-3 md:max-w-sm">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                Alterar status
              </Label>
              <Select
                value={statusToUpdate}
                onValueChange={(value) => setStatusToUpdate(value as TicketStatus)}
              >
                <SelectTrigger className="transition-colors focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Aberto</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                  <SelectItem value="WAITING_USER">Aguardando usuario</SelectItem>
                  <SelectItem value="RESOLVED">Resolvido</SelectItem>
                  <SelectItem value="CANCELED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() => changeStatusMutation.mutate()}
                disabled={
                  changeStatusMutation.isPending ||
                  statusToUpdate === ticket.status ||
                  ticket.status === "CANCELED" ||
                  statusToUpdate === "CANCELED"
                }
                className="gap-1.5 shadow-md shadow-primary/20"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {changeStatusMutation.isPending ? "Atualizando..." : "Aplicar status"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New message */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Send className="h-5 w-5 text-muted-foreground" />
            Nova mensagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submitMessage}>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium text-foreground">
                Mensagem
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder="Descreva atualizacoes ou duvidas."
                className="transition-colors focus-visible:border-primary"
              />
              {isModeratorMode && (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={isInternalMessage}
                    onChange={(event) => setIsInternalMessage(event.target.checked)}
                    className="rounded border-border accent-primary"
                  />
                  <Eye className="h-3.5 w-3.5" />
                  Mensagem interna (visivel apenas para moderacao)
                </label>
              )}
            </div>
            {messageError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {messageError}
              </div>
            )}
            <Button
              type="submit"
              disabled={addMessageMutation.isPending}
              className="gap-2 shadow-md shadow-primary/20"
            >
              <Send className="h-4 w-4" />
              {addMessageMutation.isPending ? "Enviando..." : "Enviar mensagem"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Clock className="h-8 w-8" />
              <p className="text-sm">Sem eventos registrados neste chamado.</p>
            </div>
          )}

          <div className="space-y-3">
            {timeline.map((item) => {
              if (item.kind === "event") {
                return (
                  <div
                    key={`event-${item.id}`}
                    className="relative rounded-xl border border-border/60 bg-accent/50 p-4"
                  >
                    <div className="absolute left-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="pl-9">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Evento
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {item.payload.event_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Por {item.payload.triggered_by.full_name || item.payload.triggered_by.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`msg-${item.id}`}
                  className="relative rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/20"
                >
                  <div className="absolute left-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-3 w-3 text-primary" />
                  </div>
                  <div className="pl-9">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Mensagem
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {item.payload.author.full_name || item.payload.author.email}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                      {item.payload.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
