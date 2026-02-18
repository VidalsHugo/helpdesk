import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";
import {
  Building2,
  ClipboardList,
  PlusCircle,
  UserCircle,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="space-y-8">
      {/* Page heading with greeting */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {"Bem-vindo, "}
          <span className="text-primary">
            {user?.full_name?.split(" ")[0] || "usuario"}
          </span>
        </h1>
        <p className="text-muted-foreground">
          Gerencie seus chamados e acesse os recursos do sistema.
        </p>
      </div>

      {/* Company banner */}
      <Link
        to="/info"
        className="group block overflow-hidden rounded-xl border border-border/60"
      >
        <div
          className="relative min-h-[180px] bg-cover bg-center p-6 md:min-h-[220px] md:p-8"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(7,53,45,0.85) 0%, rgba(15,118,110,0.65) 55%, rgba(15,118,110,0.45) 100%), url('https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1600&q=80')",
          }}
        >
          <div className="relative z-10 max-w-2xl space-y-3 text-white">
            <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur">
              <Building2 className="h-4 w-4" />
              EmpresaTech
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Sua plataforma de suporte interno
            </h2>
            <p className="text-sm text-white/90 md:text-lg">
              Clique aqui para saber mais sobre beneficios, cultura e infraestrutura da nossa empresa.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              Ver informacoes da empresa
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>

      {/* Quick action cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Info da empresa */}
        <Card className="group relative overflow-hidden border-border/60 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary/0 transition-all group-hover:bg-primary/60" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base font-semibold text-foreground">
                  Info da empresa
                </CardTitle>
              </div>
            </div>
            <CardDescription className="mt-2 text-muted-foreground">
              Beneficios, direitos, cultura e infraestrutura interna.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              variant="ghost"
              className="group/btn -ml-2 gap-2 text-primary hover:bg-primary/5 hover:text-primary"
            >
              <Link to="/info">
                Ver informacoes
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Meus chamados */}
        <Card className="group relative overflow-hidden border-border/60 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary/0 transition-all group-hover:bg-primary/60" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base font-semibold text-foreground">
                  Meus chamados
                </CardTitle>
              </div>
            </div>
            <CardDescription className="mt-2 text-muted-foreground">
              Acompanhe chamados abertos e historico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              variant="ghost"
              className="group/btn -ml-2 gap-2 text-primary hover:bg-primary/5 hover:text-primary"
            >
              <Link to="/meus-chamados">
                Abrir lista
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Novo chamado */}
        <Card className="group relative overflow-hidden border-primary/20 bg-primary/[0.03] transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary/60" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base font-semibold text-foreground">
                  Novo chamado
                </CardTitle>
              </div>
            </div>
            <CardDescription className="mt-2 text-muted-foreground">
              Registre um novo atendimento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="gap-2 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              <Link to="/meus-chamados/novo">
                Criar chamado
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Perfil */}
        <Card className="group relative overflow-hidden border-border/60 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary/0 transition-all group-hover:bg-primary/60" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <UserCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base font-semibold text-foreground">
                  Perfil
                </CardTitle>
              </div>
            </div>
            <CardDescription className="mt-2 text-muted-foreground">
              Gerencie seus dados basicos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              variant="ghost"
              className="group/btn -ml-2 gap-2 text-primary hover:bg-primary/5 hover:text-primary"
            >
              <Link to="/profile">
                Abrir perfil
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick summary */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            Resumo rapido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Usuario:</span>
              <span className="font-medium text-foreground">
                {user?.full_name || user?.email}
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Funcao:</span>
              <Badge
                variant="secondary"
                className="font-medium capitalize"
              >
                {user?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
