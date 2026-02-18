"""
Custom User model with UUID, email-based login, and role system.
"""

import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserRole(models.TextChoices):
    """Papéis disponíveis no sistema."""
    USER = "USER", "Usuário"
    MODERATOR = "MODERATOR", "Moderador"
    ADMIN = "ADMIN", "Administrador"


class UserManager(BaseUserManager):
    """
    Custom manager para User com email como identificador único.
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O email é obrigatório.")
        email = self.normalize_email(email)
        extra_fields.setdefault("role", UserRole.USER)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", UserRole.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser precisa ter is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser precisa ter is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User do HelpDesk.
    - UUID como PK
    - Email como login (sem username)
    - Role explícito (USER, MODERATOR, ADMIN)
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    email = models.EmailField(
        "email",
        unique=True,
        db_index=True,
    )
    first_name = models.CharField("nome", max_length=150, blank=True)
    last_name = models.CharField("sobrenome", max_length=150, blank=True)
    role = models.CharField(
        "papel",
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.USER,
        db_index=True,
    )
    is_active = models.BooleanField("ativo", default=True)
    is_staff = models.BooleanField("staff", default=False)
    created_at = models.DateTimeField("criado em", auto_now_add=True)
    updated_at = models.DateTimeField("atualizado em", auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        """Retorna nome completo."""
        full = f"{self.first_name} {self.last_name}".strip()
        return full or self.email

    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN

    @property
    def is_moderator(self):
        return self.role == UserRole.MODERATOR

    @property
    def is_moderator_or_admin(self):
        return self.role in (UserRole.MODERATOR, UserRole.ADMIN)
