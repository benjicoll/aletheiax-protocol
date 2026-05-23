"""SDK exceptions."""

from __future__ import annotations


class AletheiaError(Exception):
    """Base class for all SDK errors."""


class AletheiaApiError(AletheiaError):
    """Raised for any non-2xx API response, carrying the parsed detail."""

    def __init__(self, status: int, detail: object):
        self.status = status
        self.detail = detail
        super().__init__(self._format(detail, status))

    @staticmethod
    def _format(detail: object, status: int) -> str:
        if isinstance(detail, str):
            return detail
        if isinstance(detail, list):
            msgs = [d.get("msg") for d in detail if isinstance(d, dict) and d.get("msg")]
            if msgs:
                return "; ".join(msgs)
        if isinstance(detail, dict) and "detail" in detail:
            return AletheiaApiError._format(detail["detail"], status)
        return f"Request failed with status {status}"


class NotAuthenticatedError(AletheiaError):
    """Raised when an authenticated call is made before login()."""

    def __init__(self) -> None:
        super().__init__("Not authenticated — call client.login(wallet) first.")
