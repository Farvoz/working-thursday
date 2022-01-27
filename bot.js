const { Telegraf } =  require('telegraf')
const {
  createEvent,
  getEventsForChat,
  deleteEventsForChat,
  getAllEvents,
} = require('./db')
const {
  parseAddRecurrentMessage,
} = require('./utils')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)
const chatId = process.env.CHAT_ID
const cronTemplate = process.env.CRON


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

bot.launch()
console.log("Стартанули успешно!")

//require('./job')(cronTemplate, pushPoll)

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
