from typing import Any, Generic, TypeVar

T = TypeVar('T')

class RunMeldOptions(Generic[T]):
    """Options for running a Meld workflow."""
    
    def __init__(
        self,
        meld_id: str,
        instructions: str,
        response_object: T,
        callback_url: str = None,
        timeout: float = None,
    ):
        self.meld_id = meld_id
        self.instructions = instructions
        self.response_object = response_object
        self.callback_url = callback_url
        self.timeout = timeout
