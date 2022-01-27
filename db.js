const monk = require('monk');
require('dotenv').config()

const password = process.env.MONGO_PASS;

const uri = `mongodb+srv://bot_user:${password}@cluster0.3rhwd.mongodb.net/Bot?retryWrites=true&w=majority`;

const db = monk(uri);

async function createRecurrentEvent(name, time, chatId) {
  const EventCollection = db.collection('events');
  const events = await EventCollection.find({})
  console.log(events)
}

createRecurrentEvent()
