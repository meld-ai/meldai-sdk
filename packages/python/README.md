# Meld.ai Python SDK

> ⚠️ **WORK IN PROGRESS** ⚠️
> 
> This Python SDK is currently under development and not yet ready for production use.

Official Python SDK for **Meld.ai** — your all-in-one toolkit for building with AI.

Go from duct-taped prompts to durable AI systems — fast. Meld is your workbench for designing, controlling, collaborating & deploying AI systems with confidence. This SDK lets you programmatically run your Melds (AI workflows) with full observability and type safety.

## Install

```bash
pip install meldai-sdk
```

## Quickstart

```python
import os
from meldai import MeldClient, MeldClientOptions, EnsureAndRunWebhookOptions

client = MeldClient(MeldClientOptions(api_key=os.getenv("MELD_API_KEY")))

class StructuredOutput:
    def __init__(self, body: str, title: str):
        self.body = body
        self.title = title

result = client.melds.build_and_run(BuildAndRunOptions(
    name="translate-to-french",
    input={
        "text": "Hello world",
        "instructions": "Convert the provided input into french"
    },
    mode="sync",
    response_object=StructuredOutput(title="", body=""),
))

print('result', result)
# Output: {'title': 'Bonjour', 'body': 'Ceci est une charge utile de test'}
```

## API

### `MeldClient(options: MeldClientOptions)`

Creates a new Meld client with the given options.

```python
class MeldClientOptions:
    def __init__(
        self,
        api_key: str = None,           # API key (defaults to MELD_API_KEY env var)
        base_url: str = None,          # API base URL (defaults to production endpoint)
        timeout: float = None,         # Request timeout (defaults to 60s)
        session: requests.Session = None,  # Custom requests session (optional)
    )
```

### `client.melds.build_and_run(options: BuildAndRunOptions[T]) -> T`

Ensures (create/update) a meld by name and runs it.

```python
class BuildAndRunOptions:
    def __init__(
        self,
        name: str,                     # Name of the meld to ensure and run
        input: Dict[str, Any],         # Input data to process
        mode: str,                     # Execution mode: "sync" or "async"
        response_object: T,            # Expected response structure
        callback_url: str = None,      # Optional callback URL (required for async mode)
        metadata: Dict[str, Any] = None, # Optional metadata
        timeout: float = None,         # Override default timeout (optional)
    )
```

## Error Handling

API errors are raised as `MeldAPIError`:

```python
try:
    result = client.melds.build_and_run(options)
except MeldAPIError as e:
    print(f"API Error: {e.message} (status: {e.status}, run: {e.run_id})")
except Exception as e:
    print(f"Other error: {e}")
```

## Examples

See `example.py` for a complete working example.

## License

MIT © 2025
