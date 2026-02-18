"""
Service layer for ticket business rules.
"""

import logging

from django.db import transaction
from django.utils import timezone

from notifications.tasks import send_ticket_email_task

from .models import Ticket, TicketEvent, TicketEventType, TicketMessage, TicketStatus

logger = logging.getLogger("helpdesk")


def _enqueue_ticket_email(*, ticket, subject, message, recipients):
    recipients = sorted({email for email in recipients if email})
    if not recipients:
        return

    def _send():
        try:
            send_ticket_email_task.delay(
                subject=subject,
                message=message,
                recipient_list=recipients,
            )
        except Exception as exc:
            logger.warning(f"Failed to enqueue email for ticket {ticket.id}: {exc}")

    transaction.on_commit(_send)


@transaction.atomic
def create_ticket(*, user, title, description, priority, category):
    ticket = Ticket.objects.create(
        title=title,
        description=description,
        priority=priority,
        category=category,
        created_by=user,
        status=TicketStatus.OPEN,
    )
    TicketEvent.objects.create(
        ticket=ticket,
        event_type=TicketEventType.CREATED,
        from_value="",
        to_value=TicketStatus.OPEN,
        triggered_by=user,
    )
    _enqueue_ticket_email(
        ticket=ticket,
        subject=f"[HelpDesk] Novo chamado aberto: {ticket.title}",
        message=(
            f"Um novo chamado foi criado.\n\n"
            f"ID: {ticket.id}\n"
            f"Titulo: {ticket.title}\n"
            f"Prioridade: {ticket.priority}\n"
            f"Categoria: {ticket.category}\n"
            f"Status: {ticket.status}\n"
        ),
        recipients=[user.email],
    )
    return ticket


@transaction.atomic
def assign_ticket(*, ticket, assigned_to, triggered_by):
    previous = ticket.assigned_to
    ticket.assigned_to = assigned_to
    ticket.save(update_fields=["assigned_to", "updated_at"])

    if assigned_to:
        event_type = TicketEventType.ASSIGNED
        to_value = str(assigned_to.id)
    else:
        event_type = TicketEventType.UNASSIGNED
        to_value = ""

    TicketEvent.objects.create(
        ticket=ticket,
        event_type=event_type,
        from_value=str(previous.id) if previous else "",
        to_value=to_value,
        triggered_by=triggered_by,
    )
    _enqueue_ticket_email(
        ticket=ticket,
        subject=f"[HelpDesk] Chamado atualizado: atribuicao ({ticket.title})",
        message=(
            f"O chamado {ticket.id} teve alteracao de atribuicao.\n"
            f"Anterior: {previous.email if previous else 'Nao atribuido'}\n"
            f"Atual: {assigned_to.email if assigned_to else 'Nao atribuido'}\n"
        ),
        recipients=[
            ticket.created_by.email,
            previous.email if previous else "",
            assigned_to.email if assigned_to else "",
        ],
    )
    return ticket


@transaction.atomic
def change_status(*, ticket, new_status, triggered_by):
    if ticket.status == TicketStatus.CANCELED:
        raise ValueError("Ticket cancelado nao pode ter status alterado.")

    if new_status == TicketStatus.CANCELED:
        raise ValueError("Use o endpoint de cancelamento para cancelar.")

    previous = ticket.status
    if previous == new_status:
        return ticket

    ticket.status = new_status

    if new_status == TicketStatus.RESOLVED:
        ticket.closed_at = timezone.now()
    elif previous == TicketStatus.RESOLVED and new_status != TicketStatus.RESOLVED:
        ticket.closed_at = None

    ticket.save(update_fields=["status", "closed_at", "updated_at"])

    if new_status == TicketStatus.RESOLVED:
        event_type = TicketEventType.RESOLVED
    elif previous == TicketStatus.RESOLVED and new_status != TicketStatus.RESOLVED:
        event_type = TicketEventType.REOPENED
    else:
        event_type = TicketEventType.STATUS_CHANGED

    TicketEvent.objects.create(
        ticket=ticket,
        event_type=event_type,
        from_value=previous,
        to_value=new_status,
        triggered_by=triggered_by,
    )
    _enqueue_ticket_email(
        ticket=ticket,
        subject=f"[HelpDesk] Chamado atualizado: status ({ticket.title})",
        message=(
            f"O chamado {ticket.id} teve o status alterado.\n"
            f"Anterior: {previous}\n"
            f"Atual: {new_status}\n"
        ),
        recipients=[
            ticket.created_by.email,
            ticket.assigned_to.email if ticket.assigned_to else "",
        ],
    )
    return ticket


@transaction.atomic
def cancel_ticket(*, ticket, triggered_by):
    if ticket.status != TicketStatus.OPEN:
        raise ValueError("Somente tickets em OPEN podem ser cancelados.")

    ticket.status = TicketStatus.CANCELED
    ticket.canceled_at = timezone.now()
    ticket.save(update_fields=["status", "canceled_at", "updated_at"])

    TicketEvent.objects.create(
        ticket=ticket,
        event_type=TicketEventType.CANCELED,
        from_value=TicketStatus.OPEN,
        to_value=TicketStatus.CANCELED,
        triggered_by=triggered_by,
    )
    _enqueue_ticket_email(
        ticket=ticket,
        subject=f"[HelpDesk] Chamado cancelado: {ticket.title}",
        message=f"O chamado {ticket.id} foi cancelado pelo usuario.",
        recipients=[
            ticket.created_by.email,
            ticket.assigned_to.email if ticket.assigned_to else "",
        ],
    )
    return ticket


@transaction.atomic
def add_message(*, ticket, author, message, is_internal=False):
    msg = TicketMessage.objects.create(
        ticket=ticket,
        author=author,
        message=message,
        is_internal=is_internal,
    )

    TicketEvent.objects.create(
        ticket=ticket,
        event_type=TicketEventType.MESSAGE_ADDED,
        from_value="",
        to_value="INTERNAL" if is_internal else "PUBLIC",
        triggered_by=author,
    )
    _enqueue_ticket_email(
        ticket=ticket,
        subject=f"[HelpDesk] Nova mensagem no chamado: {ticket.title}",
        message=(
            f"Nova mensagem em {ticket.id}.\n"
            f"Autor: {author.email}\n"
            f"Tipo: {'interna' if is_internal else 'publica'}\n"
            f"Conteudo: {message}\n"
        ),
        recipients=[
            ticket.created_by.email if not is_internal else "",
            ticket.assigned_to.email if ticket.assigned_to else "",
            author.email if is_internal else "",
        ],
    )
    return msg
