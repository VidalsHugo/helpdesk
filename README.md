# HelpDesk SaaS (Django + React)

Sistema de atendimento (HelpDesk) com autenticação JWT, RBAC por papéis (`USER`, `MODERATOR`, `ADMIN`), gestão de chamados, analytics e notificações assíncronas por e-mail.

## Stack
- Backend: Django 5, Django REST Framework, SimpleJWT, PostgreSQL, Redis, Celery
- Frontend: React 19, TypeScript, Vite, Tailwind, shadcn/ui, React Query, Recharts
- Infra local: Docker Compose

## Arquitetura (alto nível)
- `backend/`: API REST e regras de negócio
- `frontend/`: SPA React com guards de rota e dashboard
- `docker-compose.yml`: serviços `db`, `redis`, `backend`, `celery_worker`, `frontend`

## Pré-requisitos
- Docker + Docker Compose
- (Opcional local sem Docker) Python 3.12+ e Node 20.19+ ou 22.12+

## Subir o projeto (Docker)
1. Copie variáveis de ambiente:
```bash
cp backend/.env.example backend/.env
```
2. Suba os serviços:
```bash
docker compose up --build -d
```
3. Rode migrações:
```bash
docker compose exec backend python manage.py migrate
```
4. Crie superusuário (opcional):
```bash
docker compose exec backend python manage.py createsuperuser
```

## URLs principais
- Frontend: `http://localhost:5173`
- API base: `http://localhost:8000/api/v1`
- Swagger: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- Django Admin: `http://localhost:8000/admin/`

## Principais endpoints
- Auth:
  - `POST /api/v1/auth/login/`
  - `POST /api/v1/auth/register/`
  - `POST /api/v1/auth/logout/`
  - `POST /api/v1/auth/token/refresh/`
  - `GET/PATCH /api/v1/auth/me/`
- Tickets:
  - `GET/POST /api/v1/tickets/`
  - `GET/PATCH /api/v1/tickets/<id>/`
  - `POST /api/v1/tickets/<id>/assign/`
  - `POST /api/v1/tickets/<id>/change-status/`
  - `POST /api/v1/tickets/<id>/cancel/`
  - `GET /api/v1/tickets/<id>/events/`
  - `GET/POST /api/v1/tickets/messages/`
- Analytics:
  - `GET /api/v1/analytics/tickets-by-period/`
  - `GET /api/v1/analytics/tickets-by-status/`
  - `GET /api/v1/analytics/tickets-by-moderator/`
  - `GET /api/v1/analytics/average-response-time/`
  - `GET /api/v1/analytics/average-resolution-time/`

## Dados de simulação
Script de carga para desenvolvimento:
```bash
docker compose exec backend sh -lc "python manage.py shell < /app/scripts/seed_mass_simulation.py"
```

## Testes
```bash
docker compose exec backend python manage.py test
```

## Notificações por e-mail
- Envio assíncrono via Celery (`backend/notifications/tasks.py`)
- Broker/result backend em Redis
- Configure SMTP no `backend/.env`:
  - `EMAIL_HOST`
  - `EMAIL_PORT`
  - `EMAIL_HOST_USER`
  - `EMAIL_HOST_PASSWORD`
  - `DEFAULT_FROM_EMAIL`

## Documentação completa
Leia `docs/PROJECT_DOCUMENTATION.md` para visão detalhada de módulos, segurança, fluxos e operação.

