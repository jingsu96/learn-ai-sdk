import * as dotenvSafe from "dotenv-safe";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

dotenvSafe.config();

const model = google("gemini-2.0-flash-001");

const { text } = await generateText({
  model,
  prompt: "What's the ECMAScript? (Be concise)",
});

console.log(text);
