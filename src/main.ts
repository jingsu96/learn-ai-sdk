import * as dotenvSafe from "dotenv-safe";
dotenvSafe.config();

console.log("Hello World");
console.log(process.env.GEMINI_API_KEY);
