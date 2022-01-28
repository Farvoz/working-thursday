const { Telegraf } =  require('telegraf')
require('dotenv').config()

const commands = require('./commands')
const createCronJob = require('./job')

const {
  getAllRecurrentEvents,
  dropSelectedTimeCollection
} = require('./db')
const {
  pushPoll
} = require('./utils')

const bot = new Telegraf(process.env.BOT_TOKEN)
const cronForEvents = process.env.CRON_EVENTS
const cronForQueuing = process.env.CRON_QUEUING

bot.command('quit', (ctx) => {
  ctx.leaveChat()
})

bot.help((ctx) => ctx.reply(commands['start'].description));

Object.keys(commands).forEach((command) => {
  bot.command(`/${command}`, (ctx) => {
    commands[command].callback.apply(undefined, [ctx, commands[command]])
  })
})

bot.launch()
console.log("Стартанули успешно!")

let queue = []
getAllRecurrentEvents().then((res) => {
  queue = res
})

createCronJob(cronForQueuing, async () => {
  queue = (await getAllRecurrentEvents() || []).filter(({eventTime}) => ![6,7].includes(eventTime).getDay())
  dropSelectedTimeCollection()
})

/*
createCronJob(cronForEvents, () => {
  console.log(queue)
  queue = queue.filter((item) => {
    const { eventTime, name } = item
    const now = new Date()
    console.log(eventTime)
    // think about corner cases (where we get cut off by GMT+3)
    const hoursEvent = eventTime.getHours()
    const minutesEvent = eventTime.getMinutes()
    const hoursNow = now.getHours()
    const minutesNow = now.getMinutes()
    if (!(hoursEvent <= hoursNow && minutesEvent <= minutesNow)) {
      return true
    }
    pushPoll(item.chatId, name, eventTime)
    return false
  })
})
*/

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
