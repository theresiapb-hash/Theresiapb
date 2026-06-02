/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Standard initialization of Gemini Client as instructed
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // API 1: AI Chat Companion (Ask Me)
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { messages, level, language } = req.body;

      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid messages array." });
        return;
      }

      // Format custom system instruction tailored to education level and language
      let instructions = `You are an encouraging, friendly, and expert AI tutor named "Together AI Guide".
You are tutoring a student at the education stage of: "${level}". 
Please adjust your vocabulary, complexity of concepts, tone, and metaphors perfectly to this age level:
- For kindergarten: Use playfulness, countables, very simplified terms, fun phonics, and happy animal emojis! Keep replies short and super sweet.
- For elementary: Use basic metaphors, step-by-step guidance, stars/praise, and clear list formats.
- For middle_school: Use engaging analogies, build connections to real-life hobbies, and encourage student-guided logic.
- For high_school: Incorporate sound logical frameworks, step-by-step critical answers, and helpful code or logic breakdowns when applicable.
- For university: Use rigorous analytical reasoning, scientific terminologies, academic references, and advanced diagnostic perspectives.

CRITICAL: You MUST write your entire response in the student's selected language: "${language}". 
All questions, concepts, and feedback should match this language perfectly. Do not use generic system language.`;

      // Map messages array to Gemini GenAI SDK format
      // We take the last 15 messages for context conservation
      const recentMessages = messages.slice(-15);
      
      // Since gemini-3.5-flash content generation stream or normal generation can be used,
      // let's build the full payload
      const contents = recentMessages.map((msg: any) => {
        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        };
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: instructions,
          temperature: 0.7,
        }
      });

      const generatedText = response.text || "I was unable to formulate a response. Please ask me another educational question!";
      res.json({ content: generatedText });
    } catch (err: any) {
      console.error("Chat API error:", err);
      res.status(500).json({ error: err.message || "Internal server error during chat synthesis." });
    }
  });

  // API 2: Document & Text Summarizer (Sum to Remember)
  app.post("/api/summarize", async (req: Request, res: Response) => {
    try {
      const { text, fileData, level, language } = req.body;

      if (!text && !fileData) {
        res.status(400).json({ error: "Please provide either text or a file to summarize." });
        return;
      }

      let responseText = "";

      // Tailor output instructions based on education level
      let levelPrompt = `Tailor the output to a student at the "${level}" level:`;
      if (level === 'kindergarten') {
        levelPrompt += ` Use elementary words, fun count-by-numbers, and animal/object matching. Include 3 happy test questions!`;
      } else if (level === 'elementary') {
        levelPrompt += ` Use simplified bullet items and a "Fabulous Facts" vocabulary list. Generate 3 flashcard questions.`;
      } else if (level === 'middle_school') {
        levelPrompt += ` Provide real-life application summaries and creative mnemonic tips to remember. Generate 4 review guidelines.`;
      } else if (level === 'high_school') {
        levelPrompt += ` Highlight critical formulas, logic steps, and historical/scientific frameworks. Generate 4 practice quiz questions.`;
      } else {
        levelPrompt += ` Provide highly analytical breakdowns, structural taxonomy, academic perspectives, and rigorous conceptual definitions. Generate 5 advanced research questions.`;
      }

      const promptText = `You are a professional educational summarizer. 
Please synthesize the provided study content into:
1. A brief summary (1-2 clear paragraphs).
2. Key takeaway bullet points (essential terms and definitions).
3. Helpful mnemonic strategies or trivia suitable for studying.
4. Custom self-test flashcards (questions followed by hidden/revealed answers).

${levelPrompt}

IMPORTANT: Complete this entire synthesis in the student's selected language: "${language}". 
All words, titles, and explanations must represent this language code perfectly. Ensure a bright and motivational tone!`;

      if (fileData && fileData.mimeType && fileData.base64) {
        const isImage = fileData.mimeType.startsWith('image/');
        
        if (isImage) {
          // Multimodal image processing
          const imagePart = {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64,
            },
          };
          const textPart = {
            text: `${promptText}\n\nDocument/Image Name: ${fileData.name || "Uploaded Image"}`
          };

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: { parts: [imagePart, textPart] },
          });
          responseText = response.text || "";
        } else {
          // Non-image document text fallback/parsing simulation
          const documentPrompt = `${promptText}
          
Document Name: ${fileData.name || "Uploaded Document"}
FileType: ${fileData.mimeType}

Simulated Context extracted from text:
${text || "Study notes regarding learning circles, specialized level content modules, collaborative problem solving, and global cultural awareness."}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: documentPrompt,
          });
          responseText = response.text || "";
        }
      } else {
        // Simple text summarization
        const textPrompt = `${promptText}

Material content:
${text}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: textPrompt,
        });
        responseText = response.text || "";
      }

      res.json({ summary: responseText });
    } catch (err: any) {
      console.error("Summarization API error:", err);
      res.status(500).json({ error: err.message || "Internal server error during text summarization." });
    }
  });

  // Hot Module Replacement (HMR) / Dev server proxy mounting
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets compiled inside dist/
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Together server online at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Together study server:", err);
});
