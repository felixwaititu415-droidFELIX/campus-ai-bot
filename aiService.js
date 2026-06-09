const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateAI(text) {
  try {
    if (!text || text.trim().length === 0) {
      return "Send a valid message.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: text,
    });

    return response.text || "No response from AI.";
  } catch (error) {
    console.error("Gemini ERROR:", error);
    return "AI is busy right now. Try again.";
  }
}

module.exports = { generateAI };