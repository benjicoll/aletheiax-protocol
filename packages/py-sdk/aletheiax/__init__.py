"""Official Python SDK for the AletheiaX perpetuals platform."""

from .client import AletheiaClient, Wallet
from .errors import AletheiaError, AletheiaApiError, NotAuthenticatedError
from .models import Market, Position, Agent, Tier, MyTier

__version__ = "0.4.0"

__all__ = [
    "AletheiaClient",
    "Wallet",
    "AletheiaError",
    "AletheiaApiError",
    "NotAuthenticatedError",
    "Market",
    "Position",
    "Agent",
    "Tier",
    "MyTier",
]
