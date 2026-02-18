import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import type { FormEvent } from "react";

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
import { useAuthStore } from "@/stores/authStore";
import { Headset, Lock, Mail } from "lucide-react";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const initialize = useAuthStore((state) => state.initialize);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      void initialize();
    }
  }, [initialize, initialized]);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const from =
    (location.state as LocationState | null)?.from?.pathname || "/home";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (submitError: unknown) {
      if (axios.isAxiosError(submitError)) {
        const detail =
          typeof submitError.response?.data?.detail === "string"
            ? submitError.response.data.detail
            : "Nao foi possivel autenticar.";
        setError(detail);
        return;
      }
      setError("Erro inesperado ao fazer login.");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 grid w-full max-w-6xl gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <section className="relative hidden overflow-hidden rounded-3xl border border-border/60 lg:block">
          <div
            className="min-h-[620px] bg-cover bg-center p-10"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(255,255,255,0.90) 10%, rgba(235,255,251,0.75) 45%, rgba(223,248,243,0.80) 100%), url('https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1600&q=80')",
            }}
          >
            <div className="max-w-md space-y-4">
              <h2 className="text-5xl font-bold tracking-tight text-slate-800">Bem-vindo novamente!</h2>
              <p className="text-lg leading-relaxed text-slate-700">
                Acesse o sistema para gerenciar suas solicitacoes de suporte de forma rapida e eficiente.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center">
          <div className="mb-6 flex flex-col items-center gap-3">
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

          <Card className="w-full border-border/60 shadow-xl shadow-foreground/[0.03]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-foreground">Entrar</CardTitle>
              <CardDescription className="text-muted-foreground">
                Acesse sua conta do HelpDesk.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
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
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="mt-6 border-t border-border pt-4">
                <p className="text-center text-sm text-muted-foreground">
                  Esqueceu a senha?{" "}
                  <Link
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                    to="/forgot-password"
                  >
                    Recuperar acesso
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
