#!/usr/bin/env tsx

/**
 * Basic SDK Test
 * 
 * Usage: npx tsx utilities/basic-test.ts
 */

import { MeldClient } from '../packages/sdk/src/client';

async function basicTest() {
  console.log('🧪 Running basic SDK test...\n');

  const client = new MeldClient({
    apiKey: process.env.MELD_API_KEY || 'your-api-key-here',
    baseUrl: 'https://app.meld.ai', // or 'http://localhost:3000' for local testing
  });

  try {
    const result = await client.runMeld({
      meldId: 'your-meld-id',
      instructions: 'Convert this to French: Hello, how are you?',
      responseObject: { message: 'Hello, how are you?' },
    });

    console.log('✅ Success!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

basicTest().catch(console.error);
