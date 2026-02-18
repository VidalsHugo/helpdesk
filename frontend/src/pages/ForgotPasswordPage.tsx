import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { ArrowLeft, CheckCircle2, Headset, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitted(false);
    setIsLoading(true);

    try {
      await api.post("/auth/password-reset/request/", { email });
      setSubmitted(true);
    } catch (submitError: unknown) {
      if (axios.isAxiosError(submitError)) {
        const detail =
          typeof submitError.response?.data?.detail === "string"
            ? submitError.response.data.detail
            : "Nao foi possivel enviar a solicitacao.";
        setError(detail);
      } else {
        setError("Erro inesperado ao enviar solicitacao.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Headset className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              HelpDesk
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Central de atendimento
            </p>
          </div>
        </div>

        {/* Recovery card */}
        <Card className="w-full border-border/60 shadow-xl shadow-foreground/[0.03]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-foreground">
              Recuperar senha
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Informe seu email para iniciar a recuperacao.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    Solicitacao enviada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Se o email existir, voce recebera as instrucoes de
                    recuperacao.
                  </p>
                </div>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                      className="pl-10 transition-colors focus-visible:border-primary"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar solicitacao"}
                </Button>
              </form>
            )}

            <div className="mt-6 border-t border-border pt-4">
              <Link
                className="flex items-center justify-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                to="/login"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
