#!/usr/bin/env python3
"""
Basic example using the Meld.ai Python SDK
"""

import os
from meldai import MeldClient, MeldClientOptions, EnsureAndRunWebhookOptions

def main():
    client = MeldClient(MeldClientOptions(api_key=os.getenv("MELD_API_KEY")))
    
    # Define the structured output type
    class StructuredOutput:
        def __init__(self, body: str, title: str):
            self.body = body
            self.title = title
    
    # Run the Meld workflow
    result = client.melds.ensure_and_run_webhook(EnsureAndRunWebhookOptions(
        name="translate-to-french",
        input={
            "text": "Hello world",
            "instructions": "Convert text to formal French."
        },
        mode="sync",
        response_object=StructuredOutput(title="", body=""),
    ))
    
    print('result', result)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        exit(1)
