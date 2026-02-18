type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="rounded-lg border border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
        {description || "Tela base criada para a etapa 8. Implementacao funcional vem nas etapas seguintes."}
      </p>
    </section>
  );
}
