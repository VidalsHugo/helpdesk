import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Tags,
  Clock,
  Save,
  CheckCircle2,
  ListOrdered,
  Timer,
} from "lucide-react";

export default function SettingsPage() {
  const [categories, setCategories] = useState("GENERAL,TECHNICAL,BILLING,ACCESS,BUG,FEATURE,OTHER");
  const [priorities, setPriorities] = useState("LOW,MEDIUM,HIGH,CRITICAL");
  const [firstResponseSlaHours, setFirstResponseSlaHours] = useState("8");
  const [resolutionSlaHours, setResolutionSlaHours] = useState("48");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function handleSave() {
    setSavedAt(new Date().toLocaleString("pt-BR"));
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Configuracoes
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie categorias, prioridades e SLAs do sistema.
          </p>
        </div>
      </div>

      {/* Categories & Priorities */}
      <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Tags className="h-5 w-5 text-muted-foreground" />
            Categorias e prioridades
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Defina as opcoes disponiveis para classificacao de chamados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Tags className="h-3.5 w-3.5 text-muted-foreground" />
              Categorias (CSV)
            </Label>
            <Textarea
              rows={4}
              value={categories}
              onChange={(event) => setCategories(event.target.value)}
              className="font-mono text-sm transition-colors focus-visible:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <ListOrdered className="h-3.5 w-3.5 text-muted-foreground" />
              Prioridades (CSV)
            </Label>
            <Input
              value={priorities}
              onChange={(event) => setPriorities(event.target.value)}
              className="font-mono text-sm transition-colors focus-visible:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* SLAs */}
      <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Clock className="h-5 w-5 text-muted-foreground" />
            SLAs
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Defina os tempos limite para resposta e resolucao.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Timer className="h-3.5 w-3.5 text-muted-foreground" />
              Primeira resposta (horas)
            </Label>
            <Input
              type="number"
              min={1}
              value={firstResponseSlaHours}
              onChange={(event) => setFirstResponseSlaHours(event.target.value)}
              className="max-w-40 transition-colors focus-visible:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Resolucao (horas)
            </Label>
            <Input
              type="number"
              min={1}
              value={resolutionSlaHours}
              onChange={(event) => setResolutionSlaHours(event.target.value)}
              className="max-w-40 transition-colors focus-visible:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          className="gap-2 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
        >
          <Save className="h-4 w-4" />
          Salvar configuracoes
        </Button>
        {savedAt && (
          <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ultimo salvamento: {savedAt}
          </div>
        )}
      </div>
    </section>
  );
}
