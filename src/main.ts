import * as dotenvSafe from "dotenv-safe";
import { google } from "@ai-sdk/google";
import { deepseek } from "@ai-sdk/deepseek";
import { generateText, streamText, type LanguageModel } from "ai";

dotenvSafe.config();

const gemini = google("gemini-2.0-flash-001");
const deepseekMode = deepseek.chat("deepseek-chat");

const jsExpert = async ({
  prompt,
  model,
}: {
  prompt: string;
  model: LanguageModel;
}) => {
  const { textStream } = streamText({
    model,
    prompt,
    // Sometimes the AI has to follow a specific behavior, no matter the prompt it receives. -- use system, it can be use both generateText and streamText
    system:
      "You are a JavaScript expert. Please answer the user's question concisely.",
  });

  for await (let text of textStream) {
    process.stdout.write(text);
  }
};

console.log(`\n===== GEMINI =====\n`);

await jsExpert({ prompt: "What's JavaScript?", model: gemini });

console.log("\n=======================\n");

console.log(`\n===== DEEPSEEK =====\n`);

await jsExpert({ prompt: "What's JavaScript?", model: deepseekMode });

console.log("\n=======================\n");
