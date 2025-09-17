#!/usr/bin/env tsx

/**
 * Async/Callback Test
 * 
 * Usage: npx tsx utilities/async-test.ts
 */

import { MeldClient } from '../packages/sdk/src/client';

async function asyncTest() {
  console.log('🔄 Running async SDK test...\n');

  const client = new MeldClient({
    apiKey: process.env.MELD_API_KEY || 'your-api-key-here',
    baseUrl: 'https://app.meld.ai',
  });

  try {
    const result = await client.runMeld({
      meldId: 'your-meld-id',
      instructions: 'Process this data and send result to callback',
      responseObject: { data: 'test data' },
      callbackUrl: 'https://your-callback-url.com/webhook', // Your webhook endpoint
    });

    console.log('✅ Async request sent!');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('📡 Check your webhook endpoint for the final result');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

asyncTest().catch(console.error);
