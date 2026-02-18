"""
Logging filters used by project logger configuration.
"""

from .request_context import get_request_id


class RequestIDLogFilter:
    """
    Adds request_id field to every log record.
    """

    def filter(self, record):
        record.request_id = get_request_id()
        return True
