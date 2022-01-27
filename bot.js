const { Telegraf } =  require('telegraf')
const {
  createEvent,
  getEventsForChat,
  deleteChatEvent,
  deleteAllChatEvents,
  getAllEvents,
  getChatsForUser,
  addChatForUser,
} = require('./db')
const {
  parseAddRecurrentMessage,
} = require('./utils')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)
const chatId = process.env.CHAT_ID
const cronTemplate = process.env.CRON

const DATA_ERROR = 'Ошибка данных. Попробуйте позже';
const COMMON_EXEPTION_MESSAGE = 'Что-то не так. Попробуйте /help';

bot.command('quit', (ctx) => {
  ctx.leaveChat()
})

const options = [
  '12:00', 
  '12:30', 
  '13:00', 
  '13:30', 
  '14:00', 
  '14:30', 
  '15:00',
  'Хочу посмотреть результат'
]

const pushPoll = () => {
  try {
    bot.telegram.sendPoll(chatId, 'Друзья, во сколько сегодня пойдем кушать?', options, {
      is_anonymous: false
    })
    console.log('Опрос отправил успешно')
  } catch (err) {
    console.error(err)
  }
}

bot.command('id', (ctx) => {
  ctx.telegram.sendMessage(ctx.message.chat.id, `Your id: ${ctx.message.chat.id}`)
})

bot.command('show_events', (ctx) => {
  getEventsForChat(ctx.message.chat.id).then((data) => {
    return data.map(({
      id,
      name,
      eventTime,
    }) => `${id} — [${eventTime}]: ${name}`);
  }).then((eventList) => {
    if (eventList.length) {
      ctx.telegram.sendMessage(ctx.message.chat.id, eventList.join('\n'))
    } else {
      ctx.telegram.sendMessage(ctx.message.chat.id, 'Пока нет ни одного события')
    }
  }).catch((err) => {
    ctx.telegram.sendMessage(ctx.message.chat.id, DATA_ERROR)
  });
});


bot.command('stopAll', (ctx) => {
  try {
    deleteAllChatEvents(ctx.message.chat.id).then((data) => {
      if (data && !data.deletedCount) {
        throw '(';
      }

      ctx.telegram.sendMessage(ctx.message.chat.id, 'Успех 👍')
    }).catch((err) => {
      ctx.telegram.sendMessage(ctx.message.chat.id, 'Не получилось 🥲');
    });
  } catch (err) {
    ctx.telegram.sendMessage(ctx.message.chat.id, COMMON_EXEPTION_MESSAGE);
  }
});

bot.command('stop', (ctx) => {
  const idToStopPattern = /\/stop (\S*)/;

  try {
    const idToStop = ctx.message.text.match(idToStopPattern)[1];
    deleteChatEvent(ctx.message.chat.id, idToStop).then((data) => {
      if (data && !data.deletedCount) {
        throw '(';
      }

      ctx.telegram.sendMessage(ctx.message.chat.id, 'Успех 👍')
    }).catch((err) => {
      ctx.telegram.sendMessage(ctx.message.chat.id, 'Не получилось 🥲');
    });
  } catch (err) {
    ctx.telegram.sendMessage(ctx.message.chat.id, COMMON_EXEPTION_MESSAGE);
  }
});

bot.command('addRecurrent', (ctx) => {
  const chatId = ctx.message.chat.id

  // "/addRecurrent 22:00 y late night hack
  const message = ctx.message.text

  const {
    name,
    eventTime,
    atWeekend,
  } = parseAddRecurrentMessage(message)

  createEvent(
    chatId,
    name,
    eventTime,
    true,
    atWeekend,
  )

  ctx.reply(`Создано событие ${name} на ${eventTime} ${atWeekend ? 'с выходными' : 'без выходных'}`)
})

bot.command('subscribe', (ctx) => {
  const chatId = ctx.message.chat.id
  const userId = ctx.message.from.id

  addChatForUser(userId, chatId)
})

bot.launch()
console.log("Стартанули успешно!")

//require('./job')(cronTemplate, pushPoll)

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
