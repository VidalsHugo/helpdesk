import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchX } from "lucide-react";

export default function Error404Page() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <Card className="relative z-10 w-full max-w-md border-border/60 shadow-xl shadow-foreground/[0.03]">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <SearchX className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">404 - Pagina nao encontrada</CardTitle>
          <CardDescription>A rota acessada nao existe no aplicativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link to="/home">Voltar para Home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
