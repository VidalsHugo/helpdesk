import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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
import { Textarea } from "@/components/ui/textarea";
import { createTicket } from "@/services/tickets";
import type { TicketCategory, TicketPriority } from "@/types/tickets";
import {
  PlusCircle,
  Type,
  FolderOpen,
  AlertTriangle,
  FileText,
  Send,
  AlertCircle,
} from "lucide-react";

const PRIORITY_OPTIONS: Array<{ label: string; value: TicketPriority }> = [
  { label: "Baixa", value: "LOW" },
  { label: "Media", value: "MEDIUM" },
  { label: "Alta", value: "HIGH" },
  { label: "Critica", value: "CRITICAL" },
];

const CATEGORY_OPTIONS: Array<{ label: string; value: TicketCategory }> = [
  { label: "Geral", value: "GENERAL" },
  { label: "Tecnico", value: "TECHNICAL" },
  { label: "Financeiro", value: "BILLING" },
  { label: "Acesso", value: "ACCESS" },
  { label: "Bug", value: "BUG" },
  { label: "Feature", value: "FEATURE" },
  { label: "Outro", value: "OTHER" },
];

export default function NewTicketPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [category, setCategory] = useState<TicketCategory>("GENERAL");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      if (!ticket.id) {
        setError("Chamado criado, mas o ID nao foi retornado pela API.");
        return;
      }
      navigate(`/chamados/${ticket.id}`);
    },
    onError: () => {
      setError("Nao foi possivel criar o chamado.");
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    createMutation.mutate({
      title,
      description,
      priority,
      category,
    });
  }

  return (
    <section className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
          <PlusCircle className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Novo Chamado
          </h1>
          <p className="text-sm text-muted-foreground">
            Preencha os dados abaixo para registrar um atendimento.
          </p>
        </div>
      </div>

      <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground">
            Abertura de chamado
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Descreva o problema com o maximo de detalhes possivel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                Titulo
              </Label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Descreva o problema em uma frase"
                  required
                  className="pl-10 transition-colors focus-visible:border-primary"
                />
              </div>
            </div>

            {/* Category & Priority */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  Categoria
                </Label>
                <Select value={category} onValueChange={(value) => setCategory(value as TicketCategory)}>
                  <SelectTrigger className="transition-colors focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                  Prioridade
                </Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as TicketPriority)}>
                  <SelectTrigger className="transition-colors focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Descricao
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Detalhe o problema, sintomas e contexto."
                rows={7}
                required
                className="transition-colors focus-visible:border-primary"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="gap-2 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
              >
                <Send className="h-4 w-4" />
                {createMutation.isPending ? "Enviando..." : "Criar chamado"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
