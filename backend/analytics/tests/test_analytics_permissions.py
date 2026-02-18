from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User, UserRole


class AnalyticsPermissionTests(APITestCase):
    def setUp(self):
        self.normal_user = User.objects.create_user(
            email="user@example.com",
            password="StrongPass123!",
            role=UserRole.USER,
        )
        self.moderator = User.objects.create_user(
            email="moderator@example.com",
            password="StrongPass123!",
            role=UserRole.MODERATOR,
        )

    def test_analytics_requires_moderator_or_admin(self):
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(reverse("analytics:tickets-by-status"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_moderator_can_access_analytics(self):
        self.client.force_authenticate(user=self.moderator)
        response = self.client.get(reverse("analytics:tickets-by-status"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
