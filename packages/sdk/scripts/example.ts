import { z } from 'zod';
import { MeldClient } from '../src/index.js';

const client = new MeldClient({
  apiKey: 'sk-XXX',
  // baseUrl: 'http://localhost:3000' // Override for local development
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

  const result = await client.runMeld<StructuredResult>({
    meldId: 'translate-to-french-zod',
    instructions: 'Convert the provided input into french',
    input: { message: 'Josh, CTO, age 30 and from the South of France', userId: 123 },
    responseObject: myResultSchema,
    metadata: { accountId: 222 },
  });

  console.log('result', result);

  const output = { message: 'Hello world', potentialLocations: ['New York', 'Los Angeles'] };

  const result2 = await client.runMeld<typeof output>({
    meldId: 'translate-to-french-type',
    instructions: 'Convert the provided input into french',
    input: { message: 'Hello world', userId: 123, userLocation: 'South France' },
    responseObject: output,
    metadata: { accountId: 111 },
  });

  console.log('result2', result2);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
