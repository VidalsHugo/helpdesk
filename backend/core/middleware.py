"""
Middleware utilities for request lifecycle.
"""

import uuid

from .request_context import set_request_id


class RequestIDMiddleware:
    """
    Injects a request id into context and response headers.
    """

    header_name = "HTTP_X_REQUEST_ID"
    response_header_name = "X-Request-ID"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.META.get(self.header_name) or str(uuid.uuid4())
        request.request_id = request_id
        set_request_id(request_id)

        try:
            response = self.get_response(request)
            response[self.response_header_name] = request_id
            return response
        finally:
            set_request_id("-")
