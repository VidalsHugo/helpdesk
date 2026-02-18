"""
Views for tickets and ticket messages.
"""

import logging

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import (
    IsMessageAuthorOrTicketOwnerOrModeratorOrAdmin,
    IsModeratorOrAdmin,
    IsTicketOwnerOrModeratorOrAdmin,
)

from .models import Ticket, TicketCategory, TicketEvent, TicketMessage, TicketPriority
from .serializers import (
    TicketAssignSerializer,
    TicketCreateSerializer,
    TicketEventSerializer,
    TicketMessageCreateSerializer,
    TicketMessageSerializer,
    TicketSerializer,
    TicketStatusChangeSerializer,
)
from .services import add_message, assign_ticket, cancel_ticket, change_status, create_ticket

logger = logging.getLogger("helpdesk")


class TicketListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/tickets/
    POST /api/v1/tickets/
    """

    permission_classes = [IsAuthenticated]
    queryset = Ticket.objects.select_related("created_by", "assigned_to")
    filterset_fields = ("status", "priority", "category", "assigned_to", "created_by")
    search_fields = ("title", "description")
    ordering_fields = ("created_at", "updated_at", "priority", "status")
    ordering = ("-created_at",)

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        assigned_to = self.request.query_params.get("assigned_to")
        if user.is_moderator_or_admin:
            if assigned_to == "null":
                qs = qs.filter(assigned_to__isnull=True)
            return qs
        qs = qs.filter(created_by=user)
        if assigned_to == "null":
            qs = qs.filter(assigned_to__isnull=True)
        return qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TicketCreateSerializer
        return TicketSerializer

    def perform_create(self, serializer):
        priority = serializer.validated_data.get("priority", TicketPriority.MEDIUM)
        category = serializer.validated_data.get("category", TicketCategory.GENERAL)
        ticket = create_ticket(
            user=self.request.user,
            title=serializer.validated_data["title"],
            description=serializer.validated_data["description"],
            priority=priority,
            category=category,
        )
        serializer.instance = ticket
        logger.info(f"Ticket criado: {ticket.id} por {self.request.user.email}")


class TicketDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/v1/tickets/<id>/
    PATCH /api/v1/tickets/<id>/
    """

    queryset = Ticket.objects.select_related("created_by", "assigned_to")
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "id"
    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT"):
            return [IsAuthenticated(), IsModeratorOrAdmin()]
        return [IsAuthenticated(), IsTicketOwnerOrModeratorOrAdmin()]


class TicketAssignView(APIView):
    """
    POST /api/v1/tickets/<id>/assign/
    """

    permission_classes = [IsAuthenticated, IsModeratorOrAdmin]

    def post(self, request, id):
        ticket = get_object_or_404(
            Ticket.objects.select_related("created_by", "assigned_to"),
            id=id,
        )
        serializer = TicketAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assign_ticket(
            ticket=ticket,
            assigned_to=serializer.validated_data["assigned_to"],
            triggered_by=request.user,
        )
        return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)


class TicketChangeStatusView(APIView):
    """
    POST /api/v1/tickets/<id>/change-status/
    """

    permission_classes = [IsAuthenticated, IsModeratorOrAdmin]

    def post(self, request, id):
        ticket = get_object_or_404(
            Ticket.objects.select_related("created_by", "assigned_to"),
            id=id,
        )
        serializer = TicketStatusChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            change_status(
                ticket=ticket,
                new_status=serializer.validated_data["status"],
                triggered_by=request.user,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)


class TicketCancelView(APIView):
    """
    POST /api/v1/tickets/<id>/cancel/
    """

    permission_classes = [IsAuthenticated, IsTicketOwnerOrModeratorOrAdmin]

    def post(self, request, id):
        ticket = get_object_or_404(
            Ticket.objects.select_related("created_by", "assigned_to"),
            id=id,
        )
        self.check_object_permissions(request, ticket)
        try:
            cancel_ticket(ticket=ticket, triggered_by=request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)


class TicketEventsView(APIView):
    """
    GET /api/v1/tickets/<id>/events/
    """

    permission_classes = [IsAuthenticated, IsTicketOwnerOrModeratorOrAdmin]

    def get(self, request, id):
        ticket = get_object_or_404(
            Ticket.objects.select_related("created_by", "assigned_to"),
            id=id,
        )
        self.check_object_permissions(request, ticket)
        events = TicketEvent.objects.filter(ticket=ticket).select_related("triggered_by")
        serializer = TicketEventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TicketMessageListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/tickets/messages/?ticket=<ticket_id>
    POST /api/v1/tickets/messages/
    """

    permission_classes = [IsAuthenticated]
    queryset = TicketMessage.objects.select_related("ticket", "author", "ticket__created_by")

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        ticket_id = self.request.query_params.get("ticket")

        if user.is_moderator_or_admin:
            base_qs = qs
        else:
            base_qs = qs.filter(ticket__created_by=user, is_internal=False)

        if ticket_id:
            base_qs = base_qs.filter(ticket_id=ticket_id)

        return base_qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TicketMessageCreateSerializer
        return TicketMessageSerializer

    def perform_create(self, serializer):
        ticket = serializer.validated_data["ticket"]
        msg = add_message(
            ticket=ticket,
            author=self.request.user,
            message=serializer.validated_data["message"],
            is_internal=serializer.validated_data.get("is_internal", False),
        )
        serializer.instance = msg
        logger.info(f"Mensagem adicionada em ticket {ticket.id} por {self.request.user.email}")


class TicketMessageDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/tickets/messages/<id>/
    """

    permission_classes = [IsAuthenticated, IsMessageAuthorOrTicketOwnerOrModeratorOrAdmin]
    queryset = TicketMessage.objects.select_related("ticket", "author", "ticket__created_by")
    serializer_class = TicketMessageSerializer
    lookup_field = "id"
    lookup_url_kwarg = "id"
