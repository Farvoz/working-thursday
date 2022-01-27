const monk = require('monk');
require('dotenv').config()
const MAX_INT = 3e6;

const password = process.env.MONGO_PASS;

const uri = `mongodb+srv://bot_user:${password}@cluster0.3rhwd.mongodb.net/Bot?retryWrites=true&w=majority`;

const db = monk(uri);

const EventCollection = db.collection('events');

async function getAllEvents() {
  return EventCollection.find({});
}

async function createEvent(chatId, name, eventTime, recurrent, atWeekend) {
  const randomId = Math.random() * MAX_INT;

  const newEvent = {
    chatId,
    name,
    eventTime,
    recurrent,
    id: randomId,
  };

  await EventCollection.insert(newEvent);
}

async function getEventsForChat(chatId) {
  const events = await EventCollection.find({ chatId });
  return events;
}

async function deleteEventsForChat(chatId, id) {
  if (id) {
    return await EventCollection.remove({ chatId, id })
  }
  return await EventCollection.remove({ chatId })
}


console.log(getAllEvents())

module.exports = {
  createEvent,
  getEventsForChat,
  deleteEventsForChat,
  getAllEvents,
}
