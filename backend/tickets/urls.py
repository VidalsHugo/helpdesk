from django.urls import path

from . import views

app_name = "tickets"

urlpatterns = [
    path("", views.TicketListCreateView.as_view(), name="ticket-list-create"),
    path("<uuid:id>/", views.TicketDetailView.as_view(), name="ticket-detail"),
    path("<uuid:id>/assign/", views.TicketAssignView.as_view(), name="ticket-assign"),
    path(
        "<uuid:id>/change-status/",
        views.TicketChangeStatusView.as_view(),
        name="ticket-change-status",
    ),
    path("<uuid:id>/cancel/", views.TicketCancelView.as_view(), name="ticket-cancel"),
    path("<uuid:id>/events/", views.TicketEventsView.as_view(), name="ticket-events"),
    path("messages/", views.TicketMessageListCreateView.as_view(), name="ticket-message-list-create"),
    path("messages/<uuid:id>/", views.TicketMessageDetailView.as_view(), name="ticket-message-detail"),
]
