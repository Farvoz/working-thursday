const testRecurrentString = `"/addRecurrent 22:00 y late night hack`
const { Telegraf } =  require('telegraf')

// console.log(parseAddRecurrentMessage(testRecurrentString))
const bot = new Telegraf(process.env.BOT_TOKEN)
function parseAddRecurrentMessage(str) {
  const TEMPLATE = '/addRecurrent'
  const startingIndex = str.indexOf(TEMPLATE)
  const withoutCommand = str.substring(startingIndex + TEMPLATE.length)
  const time = withoutCommand.match(/\d\d:\d\d/)

  if (!time) {
    return {error: true}
  }

  const eventTime = time[0]

  const timeIndex = withoutCommand.indexOf(eventTime)
  const name = withoutCommand.substring(timeIndex + eventTime.length).trim()

  return {
    name,
    eventTime,
  }
}

function generateOptionsByTime (time) {
  return ['14:00', '14:30'] // Сюда добавить интервалы по полчаса на 4 часа
}

// Как-то получать время в опросе

const pushPoll = (chatId, eventTime) => {
  try {
    eventTime
    bot.telegram.sendPoll(chatId, 'Друзья, во сколько сегодня пойдем кушать?', generateOptionsByTime(eventTime), {
      is_anonymous: false
    })
    console.log('ОпросF отправил успешно')
  } catch (err) {
    console.error(err)
  }
}


module.exports = {
  parseAddRecurrentMessage,
  pushPoll,
}
