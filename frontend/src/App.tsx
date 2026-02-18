import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "@/guards/RequireAuth";
import { RequireRole } from "@/guards/RequireRole";

const AppLayout = lazy(() => import("@/components/layout/AppLayout"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const CompanyInfoPage = lazy(() => import("@/pages/CompanyInfoPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const MyTicketsPage = lazy(() => import("@/pages/tickets/MyTicketsPage"));
const NewTicketPage = lazy(() => import("@/pages/tickets/NewTicketPage"));
const TicketDetailPage = lazy(() => import("@/pages/tickets/TicketDetailPage"));
const ModeratorDashboardPage = lazy(() => import("@/pages/moderator/ModeratorDashboardPage"));
const ManageTicketsPage = lazy(() => import("@/pages/moderator/ManageTicketsPage"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const UsersManagementPage = lazy(() => import("@/pages/admin/UsersManagementPage"));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
const Error401Page = lazy(() => import("@/pages/errors/Error401Page"));
const Error403Page = lazy(() => import("@/pages/errors/Error403Page"));
const Error404Page = lazy(() => import("@/pages/errors/Error404Page"));

function RouteFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <p className="text-sm text-slate-600">Carregando pagina...</p>
    </main>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/401" element={<Error401Page />} />
        <Route path="/403" element={<Error403Page />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/info" element={<CompanyInfoPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/meus-chamados" element={<MyTicketsPage />} />
            <Route path="/meus-chamados/novo" element={<NewTicketPage />} />
            <Route path="/chamados/:id" element={<TicketDetailPage />} />

            <Route element={<RequireRole roles={["MODERATOR", "ADMIN"]} />}>
              <Route path="/dashboard" element={<ModeratorDashboardPage />} />
              <Route path="/chamados" element={<ManageTicketsPage />} />
            </Route>

            <Route element={<RequireRole roles={["ADMIN"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/usuarios" element={<UsersManagementPage />} />
              <Route path="/admin/configuracoes" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Error404Page />} />
      </Routes>
    </Suspense>
  );
}

export default App;
