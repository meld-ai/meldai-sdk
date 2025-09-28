from typing import Any, Generic, TypeVar, Dict, Optional

T = TypeVar('T')

class BuildAndRunOptions(Generic[T]):
    """Options for ensuring and running a Meld workflow."""
    
    def __init__(
        self,
        name: str,
        input: Dict[str, Any],
        mode: str,
        response_object: T,
        callback_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        timeout: Optional[float] = None,
    ):
        self.name = name
        self.input = input
        self.mode = mode
        self.response_object = response_object
        self.callback_url = callback_url
        self.metadata = metadata
        self.timeout = timeout
