const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateAI(text) {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: text,
    });

    return res.text || "No response.";
  } catch (err) {
    console.error("AI error:", err);
    return "AI is busy right now. Try again.";
  }
}

module.exports = { generateAI };