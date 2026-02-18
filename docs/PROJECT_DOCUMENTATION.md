# Documentação Completa do Projeto HelpDesk

## 1. Visão geral
O HelpDesk é uma aplicação full stack para gestão de chamados internos/externos com:
- autenticação JWT
- controle de acesso por papéis (RBAC)
- trilha de auditoria por eventos
- dashboards de analytics para moderação e administração
- envio assíncrono de e-mails de notificação

Objetivo: centralizar abertura, triagem, acompanhamento e análise de chamados.

## 2. Stack técnica
- Backend:
  - Django 5.1
  - Django REST Framework
  - djangorestframework-simplejwt
  - PostgreSQL
  - Redis
  - Celery
  - drf-spectacular
- Frontend:
  - React 19 + TypeScript
  - Vite
  - Tailwind CSS
  - shadcn/ui + Radix UI
  - TanStack React Query
  - Recharts

## 3. Estrutura de pastas
- `backend/`
  - `config/`: settings e roteamento raiz da API
  - `core/`: autenticação, usuário, permissões, segurança base
  - `tickets/`: domínio de chamados (models, serializers, views, services)
  - `analytics/`: endpoints agregados para dashboard
  - `notifications/`: tarefas assíncronas (e-mail)
  - `scripts/`: scripts de seed/simulação
- `frontend/`
  - `src/pages/`: páginas da SPA
  - `src/components/`: componentes visuais e layout
  - `src/services/`: cliente HTTP e chamadas da API
  - `src/stores/`: estado de autenticação (Zustand)
  - `src/guards/`: proteção de rotas por auth/role
- `docker-compose.yml`

## 4. Modelo de domínio
## 4.1 Usuário (`core.User`)
- PK UUID
- login por e-mail
- campos: `first_name`, `last_name`, `role`, `is_active`, `is_staff`
- papéis:
  - `USER`
  - `MODERATOR`
  - `ADMIN`

## 4.2 Ticket (`tickets.Ticket`)
- PK UUID
- campos principais: `title`, `description`, `status`, `priority`, `category`
- relacionamentos:
  - `created_by` (obrigatório)
  - `assigned_to` (opcional)
- datas:
  - `created_at`, `updated_at`
  - `closed_at` quando resolvido
  - `canceled_at` quando cancelado

Status:
- `OPEN`
- `IN_PROGRESS`
- `WAITING_USER`
- `RESOLVED`
- `CANCELED`

Prioridades:
- `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

Categorias:
- `GENERAL`, `TECHNICAL`, `BILLING`, `ACCESS`, `BUG`, `FEATURE`, `OTHER`

## 4.3 Mensagens (`tickets.TicketMessage`)
- histórico de conversa por chamado
- `is_internal` para notas internas de suporte
- autor e ticket obrigatórios

## 4.4 Eventos (`tickets.TicketEvent`)
- trilha de auditoria imutável
- eventos como criação, atribuição, mudança de status, cancelamento, resolução e mensagem

## 5. Regras de negócio
Implementadas no service layer (`backend/tickets/services.py`):
- criação de ticket sempre inicia em `OPEN`
- cancelamento só permitido em `OPEN`
- mudança de status de ticket cancelado é bloqueada
- resolução preenche `closed_at`
- reabertura limpa `closed_at` quando aplicável
- toda ação relevante gera `TicketEvent`
- ações relevantes disparam notificação por e-mail (assíncrona)

## 6. Segurança
## 6.1 Autenticação
- JWT via SimpleJWT
- access token curto
- refresh token rotativo com blacklist

## 6.2 Autorização (RBAC + ownership)
Permissões principais em `backend/core/permissions.py`:
- `IsAdmin`
- `IsModerator`
- `IsModeratorOrAdmin`
- `IsTicketOwnerOrModeratorOrAdmin`
- permissões de mensagem por autor/dono/moderação

## 6.3 Hardening e API safety
- throttle por escopo (login, register, reset, etc.)
- CORS/CSRF configuráveis por ambiente
- cookies seguros e headers em produção (`DEBUG=False`)
- exception handler custom e logs com `request_id`

## 7. API REST
Base URL: `/api/v1`

## 7.1 Auth (`/auth`)
- `POST /login/`
- `POST /register/`
- `POST /logout/`
- `POST /token/refresh/`
- `POST /password-reset/request/`
- `POST /password-reset/confirm/`
- `GET/PATCH /me/`
- `POST /change-password/`
- Admin:
  - `GET/POST /users/`
  - `GET/PATCH/DELETE /users/<uuid:id>/`

## 7.2 Tickets (`/tickets`)
- `GET/POST /`
- `GET/PATCH /<uuid:id>/`
- `POST /<uuid:id>/assign/`
- `POST /<uuid:id>/change-status/`
- `POST /<uuid:id>/cancel/`
- `GET /<uuid:id>/events/`
- `GET/POST /messages/`
- `GET /messages/<uuid:id>/`

## 7.3 Analytics (`/analytics`)
- `GET /tickets-by-period/`
- `GET /tickets-by-status/`
- `GET /tickets-by-moderator/`
- `GET /average-response-time/`
- `GET /average-resolution-time/`

Filtro temporal:
- `start_date=YYYY-MM-DD`
- `end_date=YYYY-MM-DD`

## 7.4 Notifications (`/notifications`)
- namespace reservado, sem endpoints públicos no momento
- envio de e-mail é interno via Celery task

## 8. Frontend (SPA)
Rotas principais (`frontend/src/App.tsx`):
- públicas:
  - `/login`
  - `/forgot-password`
  - `/401`, `/403`, fallback `/404`
- autenticadas:
  - `/home`
  - `/info`
  - `/profile`
  - `/meus-chamados`
  - `/meus-chamados/novo`
  - `/chamados/:id`
- moderador/admin:
  - `/dashboard`
  - `/chamados`
- admin:
  - `/admin/dashboard`
  - `/admin/usuarios`
  - `/admin/configuracoes`

Guards:
- `RequireAuth`: exige sessão autenticada
- `RequireRole`: exige role autorizada

## 9. Dashboards e analytics
## 9.1 Admin
- KPIs de volume e resolução
- gráfico de tickets por dia (janela de 3 meses)
- distribuição por status
- performance por moderador

## 9.2 Moderador
- KPIs operacionais (abertos, atribuídos, SLA em risco, resposta média)
- evolução de chamados
- distribuição por status
- performance individual

## 10. Assíncrono (Redis + Celery)
Serviços:
- `redis`: broker/result backend
- `celery_worker`: processamento de tasks

Task principal:
- `send_ticket_email_task` em `backend/notifications/tasks.py`

Fluxo:
- service layer agenda envio com `transaction.on_commit`
- task envia via SMTP configurado em `.env`

## 11. Banco e IDs
- IDs principais usam UUID (`User`, `Ticket`, `TicketMessage`, `TicketEvent`)
- PostgreSQL como banco padrão

## 12. Execução local
## 12.1 Com Docker
1. `cp backend/.env.example backend/.env`
2. `docker compose up --build -d`
3. `docker compose exec backend python manage.py migrate`
4. (Opcional) `docker compose exec backend python manage.py createsuperuser`

## 12.2 Comandos úteis
- logs backend:
  - `docker compose logs -f backend`
- logs celery:
  - `docker compose logs -f celery_worker`
- shell Django:
  - `docker compose exec backend python manage.py shell`

## 13. Seed e simulação
Script:
- `backend/scripts/seed_mass_simulation.py`

Executar:
```bash
docker compose exec backend sh -lc "python manage.py shell < /app/scripts/seed_mass_simulation.py"
```

O script:
- garante moderadores adicionais
- cria alto volume de tickets
- distribui atribuições e estados para alimentar dashboards

## 14. Testes
Suites em:
- `backend/core/tests/`
- `backend/tickets/tests/`
- `backend/analytics/tests/`

Executar:
```bash
docker compose exec backend python manage.py test
```

## 15. Variáveis de ambiente principais
Arquivo: `backend/.env`

Segurança e app:
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `FRONTEND_BASE_URL`

Banco:
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`

Redis/Celery:
- `REDIS_URL`

JWT e throttle:
- `JWT_ACCESS_MINUTES`
- `THROTTLE_*`

SMTP:
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USE_TLS`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `DEFAULT_FROM_EMAIL`

## 16. Convenções e decisões importantes
- segurança real no backend, nunca no frontend
- service layer para regras críticas de ticket
- eventos de auditoria sempre persistidos
- endpoints de analytics agregados para dashboards
- frontend com lazy loading de páginas

## 17. Limitações atuais
- endpoint REST público para notificações ainda não implementado
- fluxo de reset de senha depende de tela de confirmação no frontend
- qualidade visual depende do design system atual (Tailwind + shadcn)
