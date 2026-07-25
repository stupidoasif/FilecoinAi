const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetContent = `  // Explorer API Route`;
const newContent = `  // Explain API Route
  app.post("/api/explain-doc", async (req, res) => {
    try {
      const { title, content } = req.body;
      const systemInstruction = \`You are an expert Filecoin and Web3 technical writer and educator.
The user is viewing a documentation page titled "\${title}".
Generate a beginner-friendly explanation of this documentation.
Explain difficult concepts using analogies.
Suggest next topics to learn.
Provide a small, relevant code sample or command line snippet if applicable.
Use clean Markdown formatting. Keep it concise but deeply informative.\`;
      
      const result = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          { role: 'model', parts: [{ text: "Understood." }] },
          { role: 'user', parts: [{ text: \`Here is the documentation content to explain:\\n\\n\${content}\` }] }
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

  // Explorer API Route`;

content = content.replace(targetContent, newContent);
fs.writeFileSync('server.ts', content);
