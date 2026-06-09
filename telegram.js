const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const { generateAI } = require("./aiService");
const { getUser, addMessage, resetIfNeeded } = require("./database");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

// anti-spam memory
const cooldown = new Map();

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || msg.from.is_bot) return;

    // cooldown (prevents API waste)
    const now = Date.now();
    if (cooldown.get(chatId) && now - cooldown.get(chatId) < 2000) {
      return bot.sendMessage(chatId, "Slow down 👍");
    }
    cooldown.set(chatId, now);

    // get user
    const user = await getUser(chatId);
    await resetIfNeeded(chatId);

    const LIMIT = 20;

    if (user.messages >= LIMIT) {
      return bot.sendMessage(
        chatId,
        "❌ Daily limit reached. Try again tomorrow."
      );
    }

    // AI call
    const reply = await generateAI(text);

    // update usage
    await addMessage(chatId);

    bot.sendMessage(chatId, reply);

  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, "Something went wrong.");
  }
});

console.log("🤖 Bot running...");