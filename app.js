const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: userMessage,
  });

  res.json({
    reply: response.text,
  });
});

app.listen(3000, () => {
  console.log("AI server running on port 3000");
});