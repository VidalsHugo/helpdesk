import random
from datetime import timedelta

from django.utils import timezone

from core.models import User, UserRole
from tickets.models import (
    Ticket,
    TicketCategory,
    TicketEvent,
    TicketMessage,
    TicketPriority,
    TicketStatus,
)
from tickets.services import add_message, assign_ticket, cancel_ticket, change_status, create_ticket


def ensure_extra_moderators(total_extra=4):
    created = []
    for i in range(1, total_extra + 1):
        email = f"moderator{i}@helpdesk.local"
        moderator, _ = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": f"Mod{i}",
                "last_name": "Support",
                "role": UserRole.MODERATOR,
                "is_active": True,
            },
        )
        if moderator.role != UserRole.MODERATOR:
            moderator.role = UserRole.MODERATOR
            moderator.is_active = True
            moderator.save(update_fields=["role", "is_active"])
        created.append(moderator)
    return created


def run():
    users = list(User.objects.filter(role=UserRole.USER, is_active=True))
    _ = ensure_extra_moderators(total_extra=4)
    moderators = list(User.objects.filter(role=UserRole.MODERATOR, is_active=True).order_by("email"))
    if not users:
        raise RuntimeError("No USER accounts found")

    priorities = [
        TicketPriority.LOW,
        TicketPriority.MEDIUM,
        TicketPriority.HIGH,
        TicketPriority.CRITICAL,
    ]
    categories = [
        TicketCategory.GENERAL,
        TicketCategory.TECHNICAL,
        TicketCategory.BILLING,
        TicketCategory.ACCESS,
        TicketCategory.BUG,
        TicketCategory.FEATURE,
        TicketCategory.OTHER,
    ]
    status_pool = [
        TicketStatus.IN_PROGRESS,
        TicketStatus.WAITING_USER,
        TicketStatus.RESOLVED,
    ]

    total = 260
    for i in range(total):
        creator = random.choice(users)
        ticket = create_ticket(
            user=creator,
            title=f"Simulacao ticket {i + 1}",
            description="Carga de dados para dashboard e analytics.",
            priority=random.choice(priorities),
            category=random.choice(categories),
        )

        created_at = timezone.now() - timedelta(
            days=random.randint(0, 120),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
        )
        Ticket.objects.filter(id=ticket.id).update(
            created_at=created_at,
            updated_at=created_at,
        )

        assigned = None
        if moderators and random.random() < 0.94:
            assigned = moderators[i % len(moderators)]
            assign_ticket(ticket=ticket, assigned_to=assigned, triggered_by=assigned)

        if random.random() < 0.74:
            next_status = random.choice(status_pool)
            change_status(ticket=ticket, new_status=next_status, triggered_by=assigned or creator)
        elif random.random() < 0.15 and ticket.status == TicketStatus.OPEN:
            cancel_ticket(ticket=ticket, triggered_by=creator)

        add_message(
            ticket=ticket,
            author=creator,
            message="Mensagem inicial para triagem.",
            is_internal=False,
        )
        if assigned and random.random() < 0.75:
            add_message(
                ticket=ticket,
                author=assigned,
                message="Moderacao iniciou analise.",
                is_internal=False,
            )
        if assigned and random.random() < 0.35:
            add_message(
                ticket=ticket,
                author=assigned,
                message="Internal note for support team.",
                is_internal=True,
            )

        minute_offset = random.randint(5, 240)
        TicketEvent.objects.filter(ticket=ticket).update(
            created_at=created_at + timedelta(minutes=minute_offset)
        )
        TicketMessage.objects.filter(ticket=ticket).update(
            created_at=created_at + timedelta(minutes=minute_offset + 5)
        )

    print("MASS_CREATED", total)
    print("TOTAL_MODERATORS", len(moderators))
    print("TOTAL_TICKETS", Ticket.objects.count())
    print(
        "BY_STATUS",
        {
            s: Ticket.objects.filter(status=s).count()
            for s in [
                TicketStatus.OPEN,
                TicketStatus.IN_PROGRESS,
                TicketStatus.WAITING_USER,
                TicketStatus.RESOLVED,
                TicketStatus.CANCELED,
            ]
        },
    )


run()
