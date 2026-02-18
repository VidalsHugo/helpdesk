"""
Domain models for the Ticket system.

Models:
- Ticket: Chamado principal
- TicketMessage: Histórico de mensagens / conversa
- TicketEvent: Auditoria imutável de eventos
"""

import uuid

from django.conf import settings
from django.db import models


# =============================================================================
# CHOICES
# =============================================================================

class TicketStatus(models.TextChoices):
    """Status possíveis de um chamado."""
    OPEN = "OPEN", "Aberto"
    IN_PROGRESS = "IN_PROGRESS", "Em Andamento"
    WAITING_USER = "WAITING_USER", "Aguardando Usuário"
    RESOLVED = "RESOLVED", "Resolvido"
    CANCELED = "CANCELED", "Cancelado"


class TicketPriority(models.TextChoices):
    """Prioridades de um chamado."""
    LOW = "LOW", "Baixa"
    MEDIUM = "MEDIUM", "Média"
    HIGH = "HIGH", "Alta"
    CRITICAL = "CRITICAL", "Crítica"


class TicketCategory(models.TextChoices):
    """Categorias de chamados."""
    GENERAL = "GENERAL", "Geral"
    TECHNICAL = "TECHNICAL", "Técnico"
    BILLING = "BILLING", "Financeiro"
    ACCESS = "ACCESS", "Acesso"
    BUG = "BUG", "Bug / Erro"
    FEATURE = "FEATURE", "Solicitação de Feature"
    OTHER = "OTHER", "Outro"


class TicketEventType(models.TextChoices):
    """Tipos de eventos de auditoria."""
    CREATED = "CREATED", "Chamado Criado"
    STATUS_CHANGED = "STATUS_CHANGED", "Status Alterado"
    ASSIGNED = "ASSIGNED", "Responsável Atribuído"
    UNASSIGNED = "UNASSIGNED", "Responsável Removido"
    PRIORITY_CHANGED = "PRIORITY_CHANGED", "Prioridade Alterada"
    CANCELED = "CANCELED", "Chamado Cancelado"
    RESOLVED = "RESOLVED", "Chamado Resolvido"
    REOPENED = "REOPENED", "Chamado Reaberto"
    MESSAGE_ADDED = "MESSAGE_ADDED", "Mensagem Adicionada"


# =============================================================================
# MODELS
# =============================================================================

class Ticket(models.Model):
    """
    Chamado principal do HelpDesk.

    Regras de negócio:
    - Usuário cria com status OPEN
    - Moderador pode alterar status e atribuir
    - Cancelamento só se status == OPEN
    - Ao resolver, preenche closed_at
    - Ao cancelar, preenche canceled_at
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    title = models.CharField("título", max_length=255)
    description = models.TextField("descrição")
    status = models.CharField(
        "status",
        max_length=20,
        choices=TicketStatus.choices,
        default=TicketStatus.OPEN,
        db_index=True,
    )
    priority = models.CharField(
        "prioridade",
        max_length=20,
        choices=TicketPriority.choices,
        default=TicketPriority.MEDIUM,
        db_index=True,
    )
    category = models.CharField(
        "categoria",
        max_length=20,
        choices=TicketCategory.choices,
        default=TicketCategory.GENERAL,
        db_index=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="tickets_created",
        verbose_name="criado por",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="tickets_assigned",
        verbose_name="atribuído a",
        null=True,
        blank=True,
    )
    canceled_at = models.DateTimeField("cancelado em", null=True, blank=True)
    closed_at = models.DateTimeField("fechado em", null=True, blank=True)
    created_at = models.DateTimeField("criado em", auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField("atualizado em", auto_now=True)

    class Meta:
        verbose_name = "Chamado"
        verbose_name_plural = "Chamados"
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["status", "created_at"],
                name="idx_ticket_status_created",
            ),
            models.Index(
                fields=["assigned_to", "status"],
                name="idx_ticket_assigned_status",
            ),
            models.Index(
                fields=["created_by", "status"],
                name="idx_ticket_owner_status",
            ),
        ]

    def __str__(self):
        return f"[{self.get_status_display()}] {self.title}"

    @property
    def is_open(self):
        return self.status == TicketStatus.OPEN

    @property
    def is_closed(self):
        return self.status in (TicketStatus.RESOLVED, TicketStatus.CANCELED)

    @property
    def can_be_canceled(self):
        """Só pode cancelar se estiver OPEN."""
        return self.status == TicketStatus.OPEN


class TicketMessage(models.Model):
    """
    Mensagem / conversa dentro de um chamado.

    - Registra toda comunicação entre usuário e moderadores
    - is_internal: mensagens visíveis apenas para moderador/admin
    - Imutável após criação (auditoria)
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name="messages",
        verbose_name="chamado",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="ticket_messages",
        verbose_name="autor",
    )
    message = models.TextField("mensagem")
    is_internal = models.BooleanField(
        "mensagem interna",
        default=False,
        help_text="Visível apenas para moderadores e admins.",
    )
    created_at = models.DateTimeField("criado em", auto_now_add=True)

    class Meta:
        verbose_name = "Mensagem do Chamado"
        verbose_name_plural = "Mensagens dos Chamados"
        ordering = ["created_at"]

    def __str__(self):
        prefix = "[INTERNA] " if self.is_internal else ""
        return f"{prefix}{self.author} em {self.ticket_id}"


class TicketEvent(models.Model):
    """
    Evento de auditoria imutável.

    Rastreia toda mudança importante no ticket:
    - Mudança de status
    - Atribuição de responsável
    - Cancelamento / resolução
    - Adição de mensagem

    Usado para: dashboards, SLA, compliance, timeline.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name="events",
        verbose_name="chamado",
    )
    event_type = models.CharField(
        "tipo do evento",
        max_length=30,
        choices=TicketEventType.choices,
        db_index=True,
    )
    from_value = models.CharField(
        "valor anterior",
        max_length=255,
        blank=True,
        default="",
    )
    to_value = models.CharField(
        "novo valor",
        max_length=255,
        blank=True,
        default="",
    )
    triggered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="ticket_events_triggered",
        verbose_name="disparado por",
    )
    created_at = models.DateTimeField("criado em", auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Evento do Chamado"
        verbose_name_plural = "Eventos dos Chamados"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.get_event_type_display()} — {self.ticket_id}"
