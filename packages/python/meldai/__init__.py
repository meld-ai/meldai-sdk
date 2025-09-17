"""
Meld.ai Python SDK

Official Python SDK for Meld.ai — your all-in-one toolkit for building with AI.
"""

from .client import MeldClient, MeldClientOptions
from .errors import MeldAPIError
from .types import RunMeldOptions

__version__ = "1.0.0"
__all__ = ["MeldClient", "MeldClientOptions", "MeldAPIError", "RunMeldOptions"]
