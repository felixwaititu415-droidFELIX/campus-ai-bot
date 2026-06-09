const TelegramBot = require("node-telegram-bot-api");
const db = require("./database");
const { generateAI } = require("./aiService");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

const lastRequest = new Map();

// Create or get user
function getUser(chatId, callback) {
  db.get("SELECT * FROM users WHERE chat_id = ?", [chatId], (err, user) => {
    if (err) return callback(null);

    if (!user) {
      db.run(
        "INSERT INTO users (chat_id, messages, last_reset) VALUES (?, 0, ?)",
        [chatId, new Date().toDateString()]
      );

      return callback({
        chat_id: chatId,
        messages: 0,
        last_reset: new Date().toDateString(),
      });
    }

    callback(user);
  });
}

// Update usage
function addMessage(chatId) {
  db.run(
    "UPDATE users SET messages = messages + 1 WHERE chat_id = ?",
    [chatId]
  );
}

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.trim().length === 0) return;
    if (msg.from.is_bot) return;

    // cooldown (prevents spam + quota burn)
    const now = Date.now();
    if (lastRequest.get(chatId) && now - lastRequest.get(chatId) < 2000) {
      return bot.sendMessage(chatId, "Slow down 👍");
    }
    lastRequest.set(chatId, now);

    // get user
    getUser(chatId, async (user) => {
      if (!user) return;

      // reset daily counter
      const today = new Date().toDateString();
      if (user.last_reset !== today) {
        db.run(
          "UPDATE users SET messages = 0, last_reset = ? WHERE chat_id = ?",
          [today, chatId]
        );
        user.messages = 0;
      }

      // OPTIONAL LIMIT (you can change later for KSh 10/day system)
      const LIMIT = 20;

      if (user.messages >= LIMIT) {
        return bot.sendMessage(
          chatId,
          "❌ Daily limit reached. Try again tomorrow or upgrade later."
        );
      }

      // AI call
      const reply = await generateAI(text);

      // update usage
      addMessage(chatId);

      bot.sendMessage(chatId, reply);
    });
  } catch (error) {
    console.error("BOT ERROR:", error);
    bot.sendMessage(msg.chat.id, "Something went wrong.");
  }
});

console.log("🤖 Telegram AI Bot running...");