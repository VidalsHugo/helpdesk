"""
Global DRF exception handler.
"""

import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

from .request_context import get_request_id

logger = logging.getLogger("helpdesk")


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    request_id = get_request_id()

    if response is None:
        logger.exception("Unhandled API exception", exc_info=exc)
        return Response(
            {
                "detail": "Erro interno do servidor.",
                "request_id": request_id,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if isinstance(response.data, dict):
        response.data["request_id"] = request_id
    else:
        response.data = {
            "detail": response.data,
            "request_id": request_id,
        }
    return response
