import json
import os
from typing import Any, Dict, Optional, TypeVar, Generic
import requests
from .errors import MeldAPIError
from .types import RunMeldOptions

T = TypeVar('T')

DEFAULT_BASE_URL = "https://sdk-api.meld.ai"
DEFAULT_TIMEOUT = 60.0


class MeldClientOptions:
    """Configuration options for the Meld client."""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: Optional[float] = None,
        session: Optional[requests.Session] = None,
    ):
        self.api_key = api_key or os.getenv("MELD_API_KEY")
        self.base_url = base_url or DEFAULT_BASE_URL
        self.timeout = timeout or DEFAULT_TIMEOUT
        self.session = session or requests.Session()


class MeldClient:
    """Main client for interacting with the Meld.ai API."""
    
    def __init__(self, options: Optional[MeldClientOptions] = None):
        self.options = options or MeldClientOptions()
        
    async def run_meld(self, options: RunMeldOptions[T]) -> T:
        """Execute a Meld workflow and return the structured result."""
        if not self.options.api_key:
            raise ValueError("Missing API key. Pass apiKey or set MELD_API_KEY environment variable")
        
        # Determine endpoint based on callbackUrl presence
        endpoint = f"{self.options.base_url}/api/v1/meld-run"
        if not options.callback_url:
            endpoint += "/sync"
        
        # Prepare request payload
        payload = {
            "meldId": options.meld_id,
            "instructions": options.instructions,
            "inputObject": options.response_object,
        }
        if options.callback_url:
            payload["callbackUrl"] = options.callback_url
        
        # Prepare headers
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.options.api_key}",
            "X-Meld-Client": f"meldai-python-sdk",
        }
        
        try:
            # Make the request
            response = self.options.session.post(
                endpoint,
                json=payload,
                headers=headers,
                timeout=self.options.timeout,
            )
            
            # Handle response
            if response.status_code < 200 or response.status_code >= 300:
                try:
                    error_data = response.json()
                except json.JSONDecodeError:
                    error_data = {"message": response.text}
                
                raise MeldAPIError(
                    message=error_data.get("message", f"API request failed with status {response.status_code}"),
                    status=response.status_code,
                    run_id=response.headers.get("X-Run-Id"),
                    data=error_data,
                )
            
            # Parse successful response
            try:
                return response.json()
            except json.JSONDecodeError as e:
                raise MeldAPIError(
                    message=f"Failed to parse response JSON: {e}",
                    status=response.status_code,
                    run_id=response.headers.get("X-Run-Id"),
                )
                
        except requests.exceptions.Timeout:
            raise MeldAPIError(
                message="Request timed out",
                status=408,
            )
        except requests.exceptions.RequestException as e:
            raise MeldAPIError(
                message=f"Request failed: {e}",
                status=0,
            )
