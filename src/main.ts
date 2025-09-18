import * as dotenvSafe from "dotenv-safe";
import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";

dotenvSafe.config();

const model = google("gemini-2.0-flash-001");

// Option 1: await until the entire stream is processed
// const { text } = streamText({
//   model,
//   prompt: "What is ECMAScript? (Please be concise)",
// });

// console.log(await text);

// Option 2: print chunk by chunk
const { textStream } = streamText({
  model,
  prompt: "What is ECMAScript? (Please be concise)",
});

for await (let text of textStream) {
  process.stdout.write(text);
}
