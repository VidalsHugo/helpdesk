import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  getAverageResponseTime,
  getTicketsByModerator,
  getTicketsByPeriod,
  getTicketsByStatus,
} from "@/services/analytics";
import { listTickets } from "@/services/tickets";
import { useAuthStore } from "@/stores/authStore";
import {
  Gauge,
  FolderOpen,
  UserCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  PieChartIcon,
  BarChart3,
  Inbox,
} from "lucide-react";

function findStatusTotal(results: Array<{ status: string; total: number }>, status: string): number {
  return results.find((item) => item.status === status)?.total || 0;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    OPEN: "Aberto",
    IN_PROGRESS: "Em andamento",
    WAITING_USER: "Aguardando usuario",
    RESOLVED: "Resolvido",
    CANCELED: "Cancelado",
  };
  return map[status] || status;
}

const STATUS_COLORS = ["hsl(168, 80%, 36%)", "hsl(200, 60%, 50%)", "hsl(43, 74%, 55%)", "hsl(145, 60%, 40%)", "hsl(0, 70%, 55%)"];

export default function ModeratorDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const periodQuery = useQuery({
    queryKey: ["analytics", "tickets-by-period", "moderator"],
    queryFn: () => getTicketsByPeriod(),
  });

  const statusQuery = useQuery({
    queryKey: ["analytics", "tickets-by-status", "moderator"],
    queryFn: () => getTicketsByStatus(),
  });

  const responseTimeQuery = useQuery({
    queryKey: ["analytics", "average-response-time", "moderator"],
    queryFn: getAverageResponseTime,
  });

  const moderatorPerfQuery = useQuery({
    queryKey: ["analytics", "tickets-by-moderator", "moderator"],
    queryFn: () => getTicketsByModerator(),
  });

  const assignedToMeQuery = useQuery({
    queryKey: ["tickets", "assigned-to-me", user?.id],
    queryFn: () => listTickets({ assigned_to: user?.id }),
    enabled: Boolean(user?.id),
  });

  const slaRiskQuery = useQuery({
    queryKey: ["tickets", "sla-risk"],
    queryFn: () => listTickets({ status: "OPEN", ordering: "created_at" }),
  });

  const openCount = findStatusTotal(statusQuery.data?.results || [], "OPEN");
  const assignedToMeCount = assignedToMeQuery.data?.count || 0;
  const avgResponseHours = responseTimeQuery.data?.average_response_hours;
  const slaRiskCount = (slaRiskQuery.data?.results || []).filter((ticket) => {
    const created = new Date(ticket.created_at).getTime();
    const ageHours = (Date.now() - created) / (1000 * 60 * 60);
    return ageHours >= 24;
  }).length;
  const myPerformance = useMemo(() => {
    if (!user) {
      return null;
    }
    return (moderatorPerfQuery.data?.results || []).find((item) => item.moderator_id === user.id) || null;
  }, [moderatorPerfQuery.data?.results, user]);

  const statusChartData = (statusQuery.data?.results || []).map((item) => ({
    name: statusLabel(item.status),
    value: item.total,
  }));

  const periodChartData = (periodQuery.data?.results || []).slice(-30).map((item) => ({
    date: item.date.slice(5),
    total: item.total,
  }));

  const moderationBars = myPerformance
    ? [
        { metric: "Atribuidos", total: myPerformance.total_assigned },
        { metric: "Resolvidos", total: myPerformance.total_resolved },
      ]
    : [];

  const kpiCards = [
    {
      title: "Chamados abertos",
      value: openCount,
      icon: FolderOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Atribuidos a mim",
      value: assignedToMeCount,
      icon: UserCheck,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      title: "SLA em risco (24h+)",
      value: slaRiskCount,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      title: "Tempo medio de resposta",
      value: avgResponseHours != null ? `${avgResponseHours.toFixed(1)}h` : "-",
      icon: Clock,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
          <Gauge className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard do Moderador
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe sua performance e o estado dos chamados.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="group relative overflow-hidden border-border/60 transition-all hover:shadow-md hover:shadow-primary/5">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-primary/0 transition-all group-hover:bg-primary/60" />
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Evolucao de chamados (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={periodChartData}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(168, 80%, 36%)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(168, 80%, 36%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(200, 10%, 45%)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(200, 10%, 45%)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid hsl(200, 15%, 90%)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="hsl(168, 80%, 36%)" fill="url(#colorTickets)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              Distribuicao por status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" outerRadius={95} label>
                  {statusChartData.map((entry, index) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid hsl(200, 15%, 90%)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance */}
      <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Minha performance
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Chamados atribuidos e resolvidos por voce.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {moderationBars.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <Inbox className="h-8 w-8" />
              <p className="text-sm">Sem dados de performance para este moderador no periodo.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moderationBars}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 90%)" />
                <XAxis dataKey="metric" tick={{ fontSize: 12 }} stroke="hsl(200, 10%, 45%)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(200, 10%, 45%)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid hsl(200, 15%, 90%)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="total" name="Total" fill="hsl(168, 80%, 36%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
