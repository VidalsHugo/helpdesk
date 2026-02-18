import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  getAverageResolutionTime,
  getTicketsByModerator,
  getTicketsByPeriod,
  getTicketsByStatus,
} from "@/services/analytics";
import {
  LayoutDashboard,
  TicketCheck,
  FolderOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  PieChartIcon,
  Users,
} from "lucide-react";

function formatHours(hours: number | null): string {
  if (hours == null) return "-";
  return `${hours.toFixed(1)}h`;
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

function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function AdminDashboardPage() {
  const endDate = useMemo(() => formatDateISO(new Date()), []);
  const startDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return formatDateISO(date);
  }, []);

  const periodQuery = useQuery({
    queryKey: ["analytics", "tickets-by-period", "admin", startDate, endDate],
    queryFn: () => getTicketsByPeriod({ startDate, endDate }),
  });

  const statusQuery = useQuery({
    queryKey: ["analytics", "tickets-by-status", "admin", startDate, endDate],
    queryFn: () => getTicketsByStatus({ startDate, endDate }),
  });

  const moderatorQuery = useQuery({
    queryKey: ["analytics", "tickets-by-moderator", "admin", startDate, endDate],
    queryFn: () => getTicketsByModerator({ startDate, endDate }),
  });

  const resolutionQuery = useQuery({
    queryKey: ["analytics", "average-resolution-time", "admin", startDate, endDate],
    queryFn: () => getAverageResolutionTime({ startDate, endDate }),
  });

  const statusMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of statusQuery.data?.results || []) {
      map[item.status] = item.total;
    }
    return map;
  }, [statusQuery.data?.results]);

  const topModerators = (moderatorQuery.data?.results || []).slice(0, 10);
  const statusChartData = (statusQuery.data?.results || []).map((item) => ({
    name: statusLabel(item.status),
    value: item.total,
  }));
  const periodChartData = (periodQuery.data?.results || []).map((item) => ({
    date: item.date.slice(5),
    total: item.total,
  }));
  const moderatorChartData = topModerators.map((item) => ({
    moderator: item.full_name.split(" ")[0] || item.email,
    assigned: item.total_assigned,
    resolved: item.total_resolved,
  }));

  const kpiCards = [
    {
      title: "Tickets (periodo)",
      value: periodQuery.data?.total_tickets || 0,
      icon: TicketCheck,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Abertos",
      value: statusMap.OPEN || 0,
      icon: FolderOpen,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      title: "Resolvidos",
      value: statusMap.RESOLVED || 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      title: "Tempo medio resolucao",
      value: formatHours(resolutionQuery.data?.average_resolution_hours ?? null),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Visao geral dos ultimos 3 meses.
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

      {/* Timeline chart */}
      <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Tickets por dia (3 meses)
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Evolucao do volume de chamados ao longo do tempo.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={periodChartData}>
              <defs>
                <linearGradient id="periodArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(168, 80%, 36%)" stopOpacity={0.3} />
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
              <Bar dataKey="total" fill="hsl(168, 80%, 36%)" fillOpacity={0.2} radius={[4, 4, 0, 0]} />
              <Area type="monotone" dataKey="total" fill="url(#periodArea)" stroke="hsl(168, 80%, 36%)" />
              <Line type="monotone" dataKey="total" stroke="hsl(200, 60%, 50%)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              Status dos tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" outerRadius={105} label>
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Users className="h-5 w-5 text-muted-foreground" />
              Performance por moderador
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {moderatorChartData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Users className="h-8 w-8" />
                <p className="text-sm">Sem dados de moderadores no periodo.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moderatorChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 90%)" />
                  <XAxis dataKey="moderator" tick={{ fontSize: 12 }} stroke="hsl(200, 10%, 45%)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(200, 10%, 45%)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid hsl(200, 15%, 90%)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="assigned" name="Atribuidos" fill="hsl(200, 60%, 50%)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolvidos" fill="hsl(168, 80%, 36%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
