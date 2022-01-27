const mongoose = require('mongoose');
require('dotenv').config()

const password = process.env.MONGO_PASS;

mongoose.connect(`mongodb+srv://bot_user:${password}@cluster0.3rhwd.mongodb.net/Bot?retryWrites=true&w=majority`);


