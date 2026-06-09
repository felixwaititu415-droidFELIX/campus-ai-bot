const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const path = require("path");

const file = path.join(__dirname, "db.json");

const adapter = new JSONFile(file);

// IMPORTANT: pass default data here
const db = new Low(adapter, { users: [] });

// initialize
async function init() {
  await db.read();

  // fallback safety (VERY IMPORTANT for Render)
  db.data ||= { users: [] };

  await db.write();
}

init();

// GET USER
async function getUser(chatId) {
  await db.read();

  let user = db.data.users.find(u => u.chat_id === chatId);

  if (!user) {
    user = {
      chat_id: chatId,
      messages: 0,
      last_reset: new Date().toDateString()
    };

    db.data.users.push(user);
    await db.write();
  }

  return user;
}

// ADD MESSAGE
async function addMessage(chatId) {
  await db.read();

  const user = db.data.users.find(u => u.chat_id === chatId);

  if (user) {
    user.messages += 1;
    await db.write();
  }
}

// RESET CHECK
async function resetIfNeeded(chatId) {
  await db.read();

  const user = db.data.users.find(u => u.chat_id === chatId);

  if (!user) return;

  const today = new Date().toDateString();

  if (user.last_reset !== today) {
    user.messages = 0;
    user.last_reset = today;
    await db.write();
  }
}

module.exports = {
  getUser,
  addMessage,
  resetIfNeeded
};