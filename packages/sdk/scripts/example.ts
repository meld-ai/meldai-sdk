import { z } from 'zod';
import { MeldClient } from '../src/index.js';

const client = new MeldClient({
  apiKey: 'sk-XXX',
});

const main = async () => {
  const myResultSchema = z.object({
    body: z.string(),
    title: z.string(),
    array: z.array(z.object({
      name: z.string(),
      age: z.number(),
    })),
  });

  type StructuredResult = typeof myResultSchema

  const result = await client.melds.ensureAndRunWebhook<StructuredResult>({
    name: 'translate-to-french-zod',
    input: {
      message: 'Josh, CTO, age 30 and from the South of France',
      userId: 123,
      instructions: 'Convert the provided input into french',
    },
    metadata: { accountId: 222 },
    responseObject: myResultSchema,
    mode: 'sync',
    // callbackUrl: 'https://5a485b550bd9.ngrok-free.app',
  });

  console.log('result', result);

  const result2 = await client.melds.ensureAndRunWebhook<StructuredResult>({
    name: 'translate-to-french-zod',
    input: {
      message: 'Josh, CTO, age 30 and from the South of France',
      userId: 123,
      instructions: 'Convert the provided input into french. And get confirmation from user first.',
    },
    metadata: { accountId: 222 },
    responseObject: myResultSchema,
    mode: 'async',
    callbackUrl: 'https://5a485b550bd9.ngrok-free.app',
  });

  console.log('result2', result2);

  // const output = { message: 'Hello world', potentialLocations: ['New York', 'Los Angeles'] };

  // const result3 = await client.melds.ensureAndRunWebhook<typeof output>({
  //   name: 'translate-to-french-type',
  //   input: {
  //     instructions: 'Convert the provided input into french',
  //     message: 'Hello world',
  //     userId: 123,
  //     userLocation: 'South France',
  //   },
  //   metadata: { accountId: 111 },
  //   mode: 'sync',
  //   responseObject: output,
  //   callbackUrl: 'https://5a485b550bd9.ngrok-free.app',
  // });

  // console.log('result3', result3);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
