"""Admin configuration for tickets app."""

from django.contrib import admin

from .models import Ticket, TicketEvent, TicketMessage


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "status",
        "priority",
        "category",
        "created_by",
        "assigned_to",
        "created_at",
    )
    list_filter = ("status", "priority", "category", "created_at")
    search_fields = ("title", "description", "created_by__email")
    readonly_fields = ("id", "created_at", "updated_at", "canceled_at", "closed_at")
    raw_id_fields = ("created_by", "assigned_to")
    date_hierarchy = "created_at"


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ("ticket", "author", "is_internal", "created_at")
    list_filter = ("is_internal", "created_at")
    search_fields = ("message", "author__email")
    readonly_fields = ("id", "created_at")
    raw_id_fields = ("ticket", "author")


@admin.register(TicketEvent)
class TicketEventAdmin(admin.ModelAdmin):
    list_display = ("ticket", "event_type", "from_value", "to_value", "triggered_by", "created_at")
    list_filter = ("event_type", "created_at")
    readonly_fields = ("id", "ticket", "event_type", "from_value", "to_value", "triggered_by", "created_at")
    raw_id_fields = ("ticket", "triggered_by")

    def has_add_permission(self, request):
        """Events são criados apenas via código (imutáveis)."""
        return False

    def has_change_permission(self, request, obj=None):
        """Events são imutáveis."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Events são imutáveis."""
        return False
