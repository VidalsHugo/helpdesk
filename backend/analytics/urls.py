from django.urls import path
from .views import (
    AverageResolutionTimeView,
    AverageResponseTimeView,
    TicketsByModeratorView,
    TicketsByPeriodView,
    TicketsByStatusView,
)

app_name = "analytics"

urlpatterns = [
    path("tickets-by-period/", TicketsByPeriodView.as_view(), name="tickets-by-period"),
    path("tickets-by-status/", TicketsByStatusView.as_view(), name="tickets-by-status"),
    path("tickets-by-moderator/", TicketsByModeratorView.as_view(), name="tickets-by-moderator"),
    path("average-response-time/", AverageResponseTimeView.as_view(), name="average-response-time"),
    path("average-resolution-time/", AverageResolutionTimeView.as_view(), name="average-resolution-time"),
]
