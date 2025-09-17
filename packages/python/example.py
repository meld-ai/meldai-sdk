#!/usr/bin/env python3
"""
Basic example using the Meld.ai Python SDK
"""

import os
from meldai import MeldClient, MeldClientOptions, RunMeldOptions

def main():
    client = MeldClient(MeldClientOptions(api_key=os.getenv("MELD_API_KEY")))
    
    # Define the structured output type
    class StructuredOutput:
        def __init__(self, body: str, title: str):
            self.body = body
            self.title = title
    
    # Run the Meld workflow
    result = client.run_meld(RunMeldOptions(
        meld_id="translate-to-french",
        instructions="Convert the provided input into french",
        response_object=StructuredOutput(title="Hello", body="This is a test payload"),
    ))
    
    print('result', result)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        exit(1)
