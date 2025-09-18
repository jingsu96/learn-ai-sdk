import * as dotenvSafe from "dotenv-safe";
import { google } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";
import * as readline from "readline";

dotenvSafe.config();

const gemini = google("gemini-2.0-flash-001");

class Chat {
  private rl: readline.Interface;
  private messages: ModelMessage[] = [
    /** System prompt can also be put it as the first chat in the history */
    {
      role: "system",
      content:
        "You are a helpful assistant. Please answer the user's questions concisely and helpfully.",
    },
  ];

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
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

        await this.streamResponse(input);
      } catch (error) {
        console.error(`Error: ${error}`);
        break;
      }
    }

    this.rl.close();
  }
}

async function main() {
  const chat = new Chat();
  await chat.start();
}

process.on("SIGINT", () => {
  console.log("\nGoodbye!");
  process.exit(0);
});

main().catch(console.error);
