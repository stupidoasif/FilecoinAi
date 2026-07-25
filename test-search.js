import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: "What is the latest filecoin network upgrade name?",
      config: {
        tools: [{ 
          googleSearch: {}
        }],
      }
    });
    console.log(result.text);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
