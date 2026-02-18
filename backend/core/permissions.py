"""
Custom permissions for role-based access control (RBAC).

Regras:
- Frontend esconde, backend bloqueia
- Permissões sempre verificadas no backend
- Combinação de role + ownership + estado do ticket
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Permite acesso apenas para ADMIN."""

    message = "Acesso restrito a administradores."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_admin
        )


class IsModerator(BasePermission):
    """Permite acesso apenas para MODERATOR."""

    message = "Acesso restrito a moderadores."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_moderator
        )


class IsModeratorOrAdmin(BasePermission):
    """Permite acesso para MODERATOR ou ADMIN."""

    message = "Acesso restrito a moderadores e administradores."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_moderator_or_admin
        )


class IsTicketOwner(BasePermission):
    """
    Permite acesso apenas ao dono do ticket.
    Requer que o objeto tenha o campo `created_by`.
    """

    message = "Você não tem permissão para acessar este chamado."

    def has_object_permission(self, request, view, obj):
        return obj.created_by == request.user


class IsTicketOwnerOrModeratorOrAdmin(BasePermission):
    """
    Permite acesso ao dono do ticket OU moderador/admin.
    Usado na maioria dos endpoints de leitura de tickets.
    """

    message = "Você não tem permissão para acessar este chamado."

    def has_object_permission(self, request, view, obj):
        user = request.user
        return (
            obj.created_by == user
            or user.is_moderator_or_admin
        )


class IsMessageAuthorOrModeratorOrAdmin(BasePermission):
    """
    Permite acesso ao autor da mensagem OU moderador/admin.
    """

    message = "Você não tem permissão para esta ação."

    def has_object_permission(self, request, view, obj):
        user = request.user
        return (
            obj.author == user
            or user.is_moderator_or_admin
        )


class IsMessageAuthorOrTicketOwnerOrModeratorOrAdmin(BasePermission):
    """
    Permite acesso ao autor da mensagem OU dono do ticket OU moderador/admin.
    """

    message = "Voce nao tem permissao para acessar esta mensagem."

    def has_object_permission(self, request, view, obj):
        user = request.user
        return (
            obj.author == user
            or obj.ticket.created_by == user
            or user.is_moderator_or_admin
        )
