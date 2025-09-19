import * as dotenvSafe from "dotenv-safe";
import { google } from "@ai-sdk/google";
import {
  streamText,
  streamObject,
  generateObject,
  type ModelMessage,
} from "ai";
import * as readline from "readline";
import { schema } from "./schema";

type OutputFormat = "auto" | "sentiment" | "structured";

dotenvSafe.config();

const gemini = google("gemini-2.0-flash-001");

class Chat {
  private rl: readline.Interface;
  private outputFormat: OutputFormat;

  private messages: ModelMessage[] = [
    /** System prompt can also be put it as the first chat in the history */
    {
      role: "system",
      content:
        "You are a helpful assistant. Please answer the user's questions concisely and helpfully.",
    },
  ];

  constructor(outputFormat: OutputFormat = "auto") {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.outputFormat = outputFormat;
  }

  private async streamResponse(prompt: string): Promise<void> {
    this.messages.push({ role: "user", content: prompt });

    try {
      const { textStream } = streamText({
        model: gemini,
        messages: this.messages,
      });

      let assistantResponse = "";
      process.stdout.write(`\nAssistant: `);

      for await (let text of textStream) {
        process.stdout.write(text);
        assistantResponse += text;
      }

      this.messages.push({ role: "assistant", content: assistantResponse });
      console.log("\n");
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * When you want to get back from your LLM is not text but structured output. using generateObject or streamObject with zod it's a right way to go!
   */
  private async streamObjectResponse(prompt: string): Promise<void> {
    this.messages.push({ role: "user", content: prompt });

    const result = streamObject({
      model: gemini,
      system: `You are an expert coach helping users with step-by-step instructions.
Create clear, actionable steps that are easy to follow.
For each step, provide a specific action and consider potential challenges.
Include checkpoints to help users track their progress and ensure they're on the right path.
Be comprehensive yet super concise in your guidance.`,
      schemaName: "Coach",
      schema,
      prompt,
    });

    process.stdout.write(`\nAssistant: `);
    for await (let chunk of result.partialObjectStream) {
      console.clear();
      console.dir(chunk, { depth: null });
    }

    const finalObject = await result.object;
    this.messages.push({
      role: "assistant",
      content: JSON.stringify(finalObject, null, 2),
    });
  }

  private async classifySentiment(prompt: string): Promise<void> {
    this.messages.push({ role: "user", content: prompt });
    process.stdout.write(`\nAssistant: `);
    const { object } = await generateObject({
      model: gemini,
      output: "enum",
      enum: ["positive", "negative", "neutral"],
      prompt,
      system:
        `Classify the sentiment of the text as either ` +
        `positive, negative, or neutral.`,
    });
    console.log(object);
    this.messages.push({
      role: "assistant",
      content: object,
    });
  }

  private async handleCommand(input: string): Promise<boolean> {
    const command = input.slice(1).toLowerCase();

    switch (command) {
      case "help":
        console.log(`
  Commands:
    /help     - Show this help
    /history  - Show conversation history
    /exit     - Exit chat

  Just type your message to chat!
  `);
        return false;

      case "history":
        console.log(JSON.stringify(this.messages, null, 2));
        return false;

      case "exit":
        console.log("See ya!");
        return true;

      default:
        console.log(
          `Unknown command: ${command}\nType /help for available commands\n`,
        );
        return false;
    }
  }

  async start(): Promise<void> {
    while (true) {
      try {
        const input: string = await new Promise((res) =>
          this.rl.question("You: ", res),
        );

        if (!input.trim()) continue;

        if (input.startsWith("/")) {
          const shouldExit = await this.handleCommand(input);
          if (shouldExit) break;
          continue;
        }

        if (this.outputFormat === "structured") {
          await this.streamObjectResponse(input);
        } else if (this.outputFormat === "sentiment") {
          await this.classifySentiment(input);
        } else {
          await this.streamResponse(input);
        }
      } catch (error) {
        console.error(`Error: ${error}`);
        break;
      }
    }

    this.rl.close();
  }
}

// pnpm build && pnpm dev --format=sentiment
async function main() {
  const args = process.argv.slice(2);
  let outputFormat: OutputFormat = "auto";

  if (args.includes("--format=sentiment")) {
    outputFormat = "sentiment";
  } else if (args.includes("--format=structured")) {
    outputFormat = "structured";
  }

  console.log(`🤖 Starting chat with output format: ${outputFormat}`);
  console.log("Type /help for commands\n");

  const chat = new Chat(outputFormat);
  await chat.start();
}

process.on("SIGINT", () => {
  console.log("\nGoodbye!");
  process.exit(0);
});

main().catch(console.error);
