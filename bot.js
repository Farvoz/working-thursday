const { Telegraf } =  require('telegraf')
require('dotenv').config()

const commands = require('./commands')

const bot = new Telegraf(process.env.BOT_TOKEN)
const cronForEvents = process.env.CRON_EVENTS
const cronForQueuing = process.env.CRON_QUEUING


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

Object.keys(commands).forEach((command) => {
  bot.command(`/${command}`, (ctx) => {
    commands[command].callback.apply(undefined, [ctx, commands[command]])
  })
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
