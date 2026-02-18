from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User, UserRole
from tickets.models import TicketStatus
from tickets.services import create_ticket


class TicketPermissionTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(email="owner@example.com", password="StrongPass123!")
        self.other_user = User.objects.create_user(email="other@example.com", password="StrongPass123!")
        self.moderator = User.objects.create_user(
            email="mod@example.com",
            password="StrongPass123!",
            role=UserRole.MODERATOR,
        )
        self.ticket = create_ticket(
            user=self.owner,
            title="Falha no sistema",
            description="Erro ao abrir pagina",
            priority="MEDIUM",
            category="TECHNICAL",
        )

    def test_user_cannot_change_ticket_status(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(
            reverse("tickets:ticket-change-status", kwargs={"id": self.ticket.id}),
            {"status": TicketStatus.IN_PROGRESS},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_moderator_can_change_ticket_status(self):
        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(
            reverse("tickets:ticket-change-status", kwargs={"id": self.ticket.id}),
            {"status": TicketStatus.IN_PROGRESS},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, TicketStatus.IN_PROGRESS)
