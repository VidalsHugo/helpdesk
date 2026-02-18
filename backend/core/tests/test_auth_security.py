from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import User


class AuthSecurityTests(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(email="user-a@example.com", password="StrongPass123!")
        self.user_b = User.objects.create_user(email="user-b@example.com", password="StrongPass123!")

    def test_logout_rejects_refresh_token_from_another_user(self):
        refresh_from_user_b = str(RefreshToken.for_user(self.user_b))

        self.client.force_authenticate(user=self.user_a)
        response = self.client.post(
            reverse("core:logout"),
            {"refresh": refresh_from_user_b},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)
