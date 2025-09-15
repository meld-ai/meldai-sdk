import { MeldClient } from "./src/index.js";

const client = new MeldClient({ apiKey: process.env.MELD_API_KEY });

const main = async () => {
  type StructuredOutput = { body: string, title: string };

  const result = await client.runMeld<StructuredOutput>({
    meldId: "translate-to-french",
    instructions: "Convert the provided input into french",
    responseObject: { title: "Hello", body: "This is a test payload" },
  });

  console.log('result', result);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
