const { Telegraf } =  require('telegraf')
const {
  createEvent,
  getEventsForChat,
  deleteEventsForChat,
  getAllEvents,
  getChatsForUser,
  addChatForUser,
} = require('./db')
const {
  parseAddRecurrentMessage,
  pushPoll,
} = require('./utils')
const {
  formQueue,
  queue,
} = require('./queue')
const createCronJob = require('./job')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)
const cronForEvents = process.env.CRON_EVENTS
const cronForQueuing = process.env.CRON_QUEUING


bot.command('quit', (ctx) => {
  ctx.leaveChat()
})

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

bot.command('subscribe', (ctx) => {
  const chatId = ctx.message.chat.id
  const userId = ctx.message.from.id

  addChatForUser(userId, chatId)
})

bot.launch()
console.log("Стартанули успешно!")

const queue = []
createCronJob(cronForQueuing, async () => {
  queue = await getAllEvents()
})

createCronJob(cronForEvents, () => {
  queue = queue.filter((item) => {
    pushPoll(chatId)
  })
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
