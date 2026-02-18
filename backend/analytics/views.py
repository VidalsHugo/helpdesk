"""
Analytics endpoints for aggregated ticket metrics.
"""

from datetime import datetime, time, timedelta

from django.db.models import Avg, Count, F, Min, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import UserRole
from core.permissions import IsModeratorOrAdmin
from tickets.models import Ticket, TicketMessage, TicketStatus


class AnalyticsBaseView(APIView):
    permission_classes = [IsAuthenticated, IsModeratorOrAdmin]

    def _get_date_window(self, request):
        """
        Parse start_date/end_date from query params.
        Defaults to the last 30 days window.
        """
        today = timezone.localdate()
        default_start = today - timedelta(days=29)
        start_raw = request.query_params.get("start_date")
        end_raw = request.query_params.get("end_date")

        start_date = parse_date(start_raw) if start_raw else default_start
        end_date = parse_date(end_raw) if end_raw else today

        if not start_date or not end_date:
            return None, None, Response(
                {"detail": "Datas invalidas. Use o formato YYYY-MM-DD."},
                status=400,
            )
        if start_date > end_date:
            return None, None, Response(
                {"detail": "start_date nao pode ser maior que end_date."},
                status=400,
            )

        start_dt = timezone.make_aware(datetime.combine(start_date, time.min))
        end_dt = timezone.make_aware(datetime.combine(end_date, time.max))
        return start_dt, end_dt, None


class TicketsByPeriodView(AnalyticsBaseView):
    """
    GET /api/v1/analytics/tickets-by-period/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """

    def get(self, request):
        start_dt, end_dt, error = self._get_date_window(request)
        if error:
            return error

        rows = (
            Ticket.objects.filter(created_at__range=(start_dt, end_dt))
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(total=Count("id"))
            .order_by("day")
        )

        data = [
            {"date": row["day"].isoformat(), "total": row["total"]}
            for row in rows
        ]
        return Response(
            {
                "start_date": start_dt.date().isoformat(),
                "end_date": end_dt.date().isoformat(),
                "total_tickets": sum(item["total"] for item in data),
                "results": data,
            }
        )


class TicketsByStatusView(AnalyticsBaseView):
    """
    GET /api/v1/analytics/tickets-by-status/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """

    def get(self, request):
        start_dt, end_dt, error = self._get_date_window(request)
        if error:
            return error

        rows = (
            Ticket.objects.filter(created_at__range=(start_dt, end_dt))
            .values("status")
            .annotate(total=Count("id"))
            .order_by("status")
        )
        counts = {row["status"]: row["total"] for row in rows}
        data = [
            {"status": status, "total": counts.get(status, 0)}
            for status, _ in TicketStatus.choices
        ]

        return Response(
            {
                "start_date": start_dt.date().isoformat(),
                "end_date": end_dt.date().isoformat(),
                "results": data,
            }
        )


class TicketsByModeratorView(AnalyticsBaseView):
    """
    GET /api/v1/analytics/tickets-by-moderator/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """

    def get(self, request):
        start_dt, end_dt, error = self._get_date_window(request)
        if error:
            return error

        rows = (
            Ticket.objects.filter(created_at__range=(start_dt, end_dt), assigned_to__isnull=False)
            .values(
                "assigned_to__id",
                "assigned_to__email",
                "assigned_to__first_name",
                "assigned_to__last_name",
            )
            .annotate(
                total_assigned=Count("id"),
                total_resolved=Count("id", filter=Q(status=TicketStatus.RESOLVED)),
            )
            .order_by("-total_assigned", "assigned_to__email")
        )

        data = []
        for row in rows:
            first_name = row.get("assigned_to__first_name") or ""
            last_name = row.get("assigned_to__last_name") or ""
            full_name = f"{first_name} {last_name}".strip() or row["assigned_to__email"]
            data.append(
                {
                    "moderator_id": row["assigned_to__id"],
                    "email": row["assigned_to__email"],
                    "full_name": full_name,
                    "total_assigned": row["total_assigned"],
                    "total_resolved": row["total_resolved"],
                }
            )

        return Response(
            {
                "start_date": start_dt.date().isoformat(),
                "end_date": end_dt.date().isoformat(),
                "results": data,
            }
        )


class AverageResponseTimeView(AnalyticsBaseView):
    """
    GET /api/v1/analytics/average-response-time/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    Response time = first moderator/admin message after ticket creation.
    """

    def get(self, request):
        start_dt, end_dt, error = self._get_date_window(request)
        if error:
            return error

        ticket_ids = list(
            Ticket.objects.filter(created_at__range=(start_dt, end_dt))
            .values_list("id", flat=True)
        )
        if not ticket_ids:
            return Response(
                {
                    "start_date": start_dt.date().isoformat(),
                    "end_date": end_dt.date().isoformat(),
                    "tickets_considered": 0,
                    "tickets_with_first_response": 0,
                    "average_response_seconds": None,
                    "average_response_hours": None,
                }
            )

        tickets = {
            ticket.id: ticket
            for ticket in Ticket.objects.filter(id__in=ticket_ids)
        }
        first_responses = (
            TicketMessage.objects.filter(
                ticket_id__in=ticket_ids,
                author__role__in=(UserRole.MODERATOR, UserRole.ADMIN),
            )
            .values("ticket_id")
            .annotate(first_response_at=Min("created_at"))
        )

        response_seconds = []
        for row in first_responses:
            ticket = tickets.get(row["ticket_id"])
            first_response_at = row["first_response_at"]
            if not ticket or not first_response_at:
                continue
            delta = first_response_at - ticket.created_at
            response_seconds.append(delta.total_seconds())

        avg_seconds = (
            sum(response_seconds) / len(response_seconds)
            if response_seconds
            else None
        )
        avg_hours = (avg_seconds / 3600) if avg_seconds is not None else None

        return Response(
            {
                "start_date": start_dt.date().isoformat(),
                "end_date": end_dt.date().isoformat(),
                "tickets_considered": len(ticket_ids),
                "tickets_with_first_response": len(response_seconds),
                "average_response_seconds": round(avg_seconds, 2) if avg_seconds is not None else None,
                "average_response_hours": round(avg_hours, 2) if avg_hours is not None else None,
            }
        )


class AverageResolutionTimeView(AnalyticsBaseView):
    """
    GET /api/v1/analytics/average-resolution-time/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    Resolution time = closed_at - created_at for resolved tickets.
    """

    def get(self, request):
        start_dt, end_dt, error = self._get_date_window(request)
        if error:
            return error

        resolved_qs = Ticket.objects.filter(
            created_at__range=(start_dt, end_dt),
            status=TicketStatus.RESOLVED,
            closed_at__isnull=False,
        ).annotate(resolution_time=F("closed_at") - F("created_at"))

        avg_delta = resolved_qs.aggregate(avg_resolution=Avg("resolution_time"))["avg_resolution"]
        avg_seconds = avg_delta.total_seconds() if avg_delta is not None else None
        avg_hours = (avg_seconds / 3600) if avg_seconds is not None else None

        return Response(
            {
                "start_date": start_dt.date().isoformat(),
                "end_date": end_dt.date().isoformat(),
                "tickets_resolved": resolved_qs.count(),
                "average_resolution_seconds": round(avg_seconds, 2) if avg_seconds is not None else None,
                "average_resolution_hours": round(avg_hours, 2) if avg_hours is not None else None,
            }
        )
