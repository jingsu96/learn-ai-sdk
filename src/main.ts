import * as dotenvSafe from "dotenv-safe";
import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";

dotenvSafe.config();

const model = google("gemini-2.0-flash-001");

const { textStream } = streamText({
  model,
  prompt: "What is ECMAScript?",
  // Sometimes the AI has to follow a specific behavior, no matter the prompt it receives. -- use system, it can be use both generateText and streamText
  system:
    "You are a JavaScript expert. Please answer the user's question concisely.",
});

for await (let text of textStream) {
  process.stdout.write(text);
}
