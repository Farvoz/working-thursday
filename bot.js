const { Telegraf } =  require('telegraf')

require('dotenv').config()

const commands = require('./commands')

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

Object.keys(commands).forEach((command) => {
  bot.command(`/${command}`, (ctx) => {
    commands[command].callback.apply(undefined, [ctx, commands[command]])
  })
})

bot.launch()
console.log("Стартанули успешно!")

//require('./job')(cronTemplate, pushPoll)

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
