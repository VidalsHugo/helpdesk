"""
Serializers for ticket API.
"""

from rest_framework import serializers

from core.models import User, UserRole
from core.serializers import UserMinimalSerializer

from .models import (
    Ticket,
    TicketEvent,
    TicketMessage,
    TicketStatus,
)


class TicketSerializer(serializers.ModelSerializer):
    created_by = UserMinimalSerializer(read_only=True)
    assigned_to = UserMinimalSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = (
            "id",
            "title",
            "description",
            "status",
            "priority",
            "category",
            "created_by",
            "assigned_to",
            "canceled_at",
            "closed_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "status",
            "created_by",
            "assigned_to",
            "canceled_at",
            "closed_at",
            "created_at",
            "updated_at",
        )


class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ("title", "description", "priority", "category")
        extra_kwargs = {
            "priority": {"required": False},
            "category": {"required": False},
        }


class TicketEventSerializer(serializers.ModelSerializer):
    triggered_by = UserMinimalSerializer(read_only=True)

    class Meta:
        model = TicketEvent
        fields = (
            "id",
            "event_type",
            "from_value",
            "to_value",
            "triggered_by",
            "created_at",
        )
        read_only_fields = fields


class TicketMessageSerializer(serializers.ModelSerializer):
    author = UserMinimalSerializer(read_only=True)

    class Meta:
        model = TicketMessage
        fields = (
            "id",
            "ticket",
            "author",
            "message",
            "is_internal",
            "created_at",
        )
        read_only_fields = ("id", "author", "created_at")


class TicketMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketMessage
        fields = ("ticket", "message", "is_internal")

    def validate_is_internal(self, value):
        request = self.context.get("request")
        if value and request and not request.user.is_moderator_or_admin:
            raise serializers.ValidationError(
                "Mensagens internas sao permitidas apenas para moderadores e admins."
            )
        return value

    def validate_ticket(self, ticket):
        request = self.context.get("request")
        if not request:
            return ticket
        user = request.user
        if user.is_moderator_or_admin:
            return ticket
        if ticket.created_by_id != user.id:
            raise serializers.ValidationError(
                "Voce nao tem permissao para enviar mensagens neste ticket."
            )
        return ticket


class TicketAssignSerializer(serializers.Serializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(
            role__in=(UserRole.MODERATOR, UserRole.ADMIN),
            is_active=True,
        ),
        allow_null=True,
        required=True,
    )


class TicketStatusChangeSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=TicketStatus.choices)
