const MAX_INT = 3e6;

const monk = require('monk');
require('dotenv').config()

const password = process.env.MONGO_PASS;
const uri = `mongodb+srv://bot_user:${password}@cluster0.3rhwd.mongodb.net/Bot?retryWrites=true&w=majority`;
const db = monk(uri);

const EventCollection = db.collection('events');
const UserCollection = db.collection('users');


async function getChatsForUser(userId) {
  const user = await UserCollection.find({ userId });
  if (!user) return null;
  return user.chatIds;
}

async function addChatForUser(userId, newChatId) {
  const prevChats = await getChatsForUser(userId)
  if (!prevChats) {
    return await UserCollection.insert({ userId , chatIds: [newChatId] })
  }
  const chatIds = [...prevChats, newChatId]
  return await UserCollection.update({ userId }, { $set: { chatIds } })
}

async function getAllEvents() {
  return await EventCollection.find({});
}

async function createEvent(chatId, name, eventTime, recurrent) {
  const randomId = Math.random() * MAX_INT | 0;

  const newEvent = {
    chatId,
    name,
    eventTime,
    recurrent,
    id: randomId,
  };

  return await EventCollection.insert(newEvent);
}

async function getEventsForChat(chatId) {
  const events = await EventCollection.find({ chatId });
  return events;
}

async function getEventsForAllChats(chatIds) {
  const events = await EventCollection.find({ chatId: {$all: chatIds} });
  return events;
}

async function deleteChatEvent(chatId, id) {
  return await EventCollection.remove({ chatId, id: Number(id) })
}

async function deleteAllChatEvents(chatId) {
  return await EventCollection.remove({ chatId })
}

module.exports = {
  createEvent,
  getEventsForChat,
  deleteChatEvent,
  deleteAllChatEvents,
  getAllEvents,
  getChatsForUser,
  addChatForUser,
  getEventsForAllChats,
}
