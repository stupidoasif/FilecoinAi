import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Initialization
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, stream } = req.body;
      
      const systemInstruction = `You are Filecoin AI Assistant.

      You are an expert on Filecoin, FOC, IPFS, Lotus, Filecoin Virtual Machine (FVM), storage providers, CIDs, decentralized storage, and the Filecoin developer ecosystem.

      Your goal is to help developers and users build on Filecoin.

      CRITICAL RULE: You MUST ONLY answer questions related to Filecoin, IPFS, Web3, and decentralized storage. 
      If the user asks a question about any other topic (e.g., general programming, math, history, cooking, weather), you MUST politely refuse to answer and state that you are specialized in the Filecoin ecosystem.

      When answering:
      - Be accurate and concise.
      - Prefer official Filecoin concepts and terminology.
      - Generate production-ready code when requested.
      - Explain APIs with examples.
      - Format responses using Markdown.

      Structure responses like this whenever appropriate:

      ## Summary

      ## Code Example

      ## API Request

      ## Explanation

      ## References`;

      const baseConfig: any = {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
      };

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const result = await ai.models.generateContentStream({
          model: "gemini-3.1-flash-lite",
          contents: [
            { role: 'user', parts: [{ text: systemInstruction }] },
            { role: 'model', parts: [{ text: "Understood. I am now the Filecoin AI Assistant. How can I help you build on Filecoin today?" }] },
            ...history,
            { role: 'user', parts: [{ text: message }] }
          ],
          config: baseConfig
        });

        for await (const chunk of result) {
          const text = chunk.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const result = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: [
            { role: 'user', parts: [{ text: systemInstruction }] },
            { role: 'model', parts: [{ text: "Understood. I am now the Filecoin AI Assistant. How can I help you build on Filecoin today?" }] },
            ...history,
            { role: 'user', parts: [{ text: message }] }
          ],
          config: baseConfig
        });
        res.json({ response: result.text });
      }
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // Code Generation API Route
  app.post("/api/generate-code", async (req, res) => {
    try {
      const { prompt, language } = req.body;
      
      const systemInstruction = `You are an expert Filecoin and Web3 code generator.
      Your task is to generate production-ready ${language} code based on the user's prompt.
      You MUST respond ONLY with the following Markdown structure, without any surrounding text or conversational filler:

      ## Summary
      <A brief paragraph explaining what the code does>
      
      ## Installation
      <The command to install dependencies, e.g., npm install web3.storage>
      
      ## Dependencies
      <List of required dependencies>
      
      ## Code
      \`\`\`${language.toLowerCase()}
      <The complete, production-ready code>
      \`\`\`
      
      ## Explanation
      <Brief explanation of important functions>
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          { role: 'model', parts: [{ text: "Understood. Please provide the prompt." }] },
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          temperature: 0.2,
        }
      });
      
      res.json({ response: result.text });
    } catch (error: any) {
      console.error("Code Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate code" });
    }
  });

  // Explain API Route
  app.post("/api/explain-doc", async (req, res) => {
    try {
      const { title, content } = req.body;
      const systemInstruction = `You are an expert Filecoin and Web3 technical writer and educator.
The user is viewing a documentation page titled "${title}".
Generate a beginner-friendly explanation of this documentation.
Explain difficult concepts using analogies.
Suggest next topics to learn.
Provide a small, relevant code sample or command line snippet if applicable.
Use clean Markdown formatting. Keep it concise but deeply informative.`;
      
      const result = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          { role: 'model', parts: [{ text: "Understood." }] },
          { role: 'user', parts: [{ text: `Here is the documentation content to explain:\n\n${content}` }] }
        ],
        config: {
          temperature: 0.5,
        }
      });
      
      res.json({ response: result.text });
    } catch (error) {
      console.error("Explain API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate explanation" });
    }
  });

  // Explorer API Route
  app.post("/api/explorer", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query is required" });
      }

      const q = query.trim();
      let filfoxRes;
      let type = '';

      if (q.startsWith('f') || q.startsWith('t') || q.startsWith('0x')) {
        // Try address
        filfoxRes = await fetch(`https://filfox.info/api/v1/address/${q}`);
        type = 'address';
      } else {
        // Try message
        filfoxRes = await fetch(`https://filfox.info/api/v1/message/${q}`);
        type = 'transaction';
      }

      if (!filfoxRes.ok) {
        return res.status(404).json({ error: "Not found" });
      }

      const data = await filfoxRes.json();
      
      // Filfox sends a 404 statusCode in its JSON for missing entities even if the HTTP code isn't 404 sometimes, but usually HTTP is 404.
      if (data.statusCode && data.statusCode !== 200) {
         return res.status(data.statusCode).json({ error: data.message || "Not found" });
      }

      res.json({ type, data });
    } catch (error: any) {
      console.error("Explorer API Error:", error);
      res.status(500).json({ error: "Failed to fetch explorer data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
