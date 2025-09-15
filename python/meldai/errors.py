class MeldAPIError(Exception):
    """Exception raised when the Meld API returns an error."""
    
    def __init__(
        self,
        message: str,
        status: int = 0,
        request_id: str = None,
        data: dict = None,
    ):
        super().__init__(message)
        self.message = message
        self.status = status
        self.request_id = request_id
        self.data = data or {}
    
    def __str__(self) -> str:
        if self.request_id:
            return f"Meld API error (status {self.status}, request {self.request_id}): {self.message}"
        return f"Meld API error (status {self.status}): {self.message}"
