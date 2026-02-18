import { Building2, Gift, Landmark, ServerCog, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BENEFITS = [
  "Plano de saude e odontologico com cobertura nacional",
  "Auxilio home office mensal para internet e energia",
  "Vale refeicao/alimentacao flexivel",
  "Seguro de vida e apoio psicologico",
  "Programa anual de certificacoes tecnicas",
];

const RIGHTS = [
  "Jornada flexivel com banco de horas transparente",
  "Politica de ferias planejadas com antecedencia",
  "Canal formal de denuncia com anonimato",
  "Plano de carreira com ciclos de avaliacao semestrais",
  "Politica de diversidade, equidade e inclusao",
];

const INFRA = [
  "Stack principal: React, TypeScript, Django, PostgreSQL, Redis e Celery",
  "Ambientes separados: desenvolvimento, homologacao e producao",
  "Pipeline CI/CD com testes automatizados e quality gates",
  "Monitoramento com logs estruturados, metricas e alertas",
  "Backups diarios e rotina de recuperacao validada",
];

const CULTURE = [
  "Times multidisciplinares orientados a produto",
  "Documentacao tecnica obrigatoria para features criticas",
  "Ritos de retrospectiva e melhoria continua",
  "Foco em acessibilidade e experiencia do usuario",
];

function ListSection({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="rounded-md border border-border/60 bg-secondary/30 px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function CompanyInfoPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Building2 className="h-3.5 w-3.5" />
            TechFlow Solutions
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Info da Empresa</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Empresa ficticia de tecnologia focada em plataformas SaaS para atendimento, automacao operacional e
          analytics corporativo.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Beneficios
            </CardTitle>
            <CardDescription>Pacote de beneficios voltado para bem-estar e crescimento profissional.</CardDescription>
          </CardHeader>
          <CardContent>
            <ListSection items={BENEFITS} />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Direitos e Politicas
            </CardTitle>
            <CardDescription>Diretrizes que garantem transparencia, seguranca e desenvolvimento.</CardDescription>
          </CardHeader>
          <CardContent>
            <ListSection items={RIGHTS} />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ServerCog className="h-5 w-5 text-primary" />
              Infraestrutura
            </CardTitle>
            <CardDescription>Base tecnica e operacao para manter disponibilidade e escalabilidade.</CardDescription>
          </CardHeader>
          <CardContent>
            <ListSection items={INFRA} />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Cultura
            </CardTitle>
            <CardDescription>Praticas de colaboracao e evolucao continua dos times.</CardDescription>
          </CardHeader>
          <CardContent>
            <ListSection items={CULTURE} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
