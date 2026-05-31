const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files statically
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. API requests will fail.");
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Utility to clean markdown formatting from Gemini JSON responses.
 */
function cleanJSONString(str) {
  let clean = str.trim();
  // Remove markdown codeblock blocks: ```json ... ``` or ``` ... ```
  if (clean.startsWith('```json')) {
    clean = clean.slice(7);
  } else if (clean.startsWith('```')) {
    clean = clean.slice(3);
  }
  if (clean.endsWith('```')) {
    clean = clean.slice(0, -3);
  }
  return clean.trim();
}

/**
 * Route: POST /api/generate-dearme
 * Description: Generates a complete reflection response from the user's future self
 */
app.post('/api/generate-dearme', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        success: false,
        error: "Gemini API client not initialized. Please configure GEMINI_API_KEY in your .env file."
      });
    }

    const { name, age, goal, struggle, oneYearVision, tone } = req.body;

    // Validate inputs
    if (!name || !age || !goal || !struggle || !oneYearVision || !tone) {
      return res.status(400).json({
        success: false,
        error: "All reflection parameters (name, age, goal, struggle, oneYearVision, tone) are required."
      });
    }

    const prompt = `You are DearMe, the future successful version of the user. You are not a generic motivational coach. You speak with emotional intelligence, clarity, and deep personal understanding. Your job is to help the user see who they are becoming, what they must change, and what they should do next.

Write as if you are the user’s future self speaking directly to their current self.

Tone selected by user: ${tone}

User details:
Name: ${name}
Age: ${age}
Goal: ${goal}
Current struggle: ${struggle}
One-year vision: ${oneYearVision}

Return only valid JSON in this exact format:
{
  "message": "A powerful 120-180 word message from the future self.",
  "futureIdentity": "A concise description of who the user is becoming.",
  "nextMoves": ["Action 1", "Action 2", "Action 3"],
  "habit": "One small daily habit they should start today.",
  "warning": "One mistake their future self warns them about.",
  "mantra": "A short memorable line they can repeat daily."
}

Make it specific. Avoid generic motivation. Avoid clichés. Make it emotional but practical.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = cleanJSONString(responseText);
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedJson);
    } catch (parseErr) {
      console.error("JSON parsing error on Gemini response:", responseText);
      return res.status(502).json({
        success: false,
        error: "Invalid JSON response format from AI model.",
        raw: responseText
      });
    }

    res.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error("Error in /api/generate-dearme:", error);
    res.status(500).json({
      success: false,
      error: "DearMe could not respond right now. Try again."
    });
  }
});

/**
 * Route: POST /api/chat-dearme
 * Description: Chat follow-up endpoint with DearMe identity context
 */
app.post('/api/chat-dearme', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        success: false,
        error: "Gemini API client not initialized. Please configure GEMINI_API_KEY in your .env file."
      });
    }

    const { userProfile, chatHistory, question } = req.body;

    if (!userProfile || !chatHistory || !question) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters. userProfile, chatHistory, and question are required."
      });
    }

    // Format recent chat history as text
    const formattedHistory = chatHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'DearMe'}: ${msg.message}`)
      .join('\n');

    const prompt = `You are DearMe, the future version of the user who already achieved their one-year vision. Reply directly to the user’s question. Be personal, sharp, honest, and useful. Do not sound like a normal AI assistant. Do not mention that you are Gemini or an AI model. Speak like the future self.

User profile:
Name: ${userProfile.name}
Age: ${userProfile.age}
Goal: ${userProfile.goal}
Struggle: ${userProfile.struggle}
One-year vision: ${userProfile.oneYearVision}
Tone: ${userProfile.tone}

Recent chat history:
${formattedHistory}

Current question:
${question}

Reply in 2-5 short paragraphs. Give at least one clear action.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const replyText = result.response.text().trim();

    res.json({
      success: true,
      reply: replyText
    });

  } catch (error) {
    console.error("Error in /api/chat-dearme:", error);
    res.status(500).json({
      success: false,
      error: "DearMe could not respond right now. Try again."
    });
  }
});

// Start Express Server only if not in serverless environment
if (process.env.NETLIFY !== 'true' && process.env.NODE_ENV !== 'test') {
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 DearMe Backend Server running on port ${PORT}`);
  console.log(`📂 Serving Frontend from: ${path.join(__dirname, '../frontend')}`);
  console.log(`🌍 Open your browser at http://localhost:${PORT}`);
  console.log(`====================================================`);
});
}

// Export app for Netlify functions
module.exports = app;
