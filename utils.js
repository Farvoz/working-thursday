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
  let hourStart = time.getHours() + 3
  let minutesStart = Math.round(time.getMinutes() / 30) * 30
  if (minutesStart === 60) {
    minutesStart = 0
    hourStart += 1
  }

  const times = []
  for (let i = 8; i--; ) {
    times.push(`${hourStart}:${minutesStart.toString().padStart(2, '0')}`)
    if (minutesStart === 0) {
      minutesStart += 30
    } else {
      minutesStart = 0
      hourStart += 1
    }
  }
  times.push(`Посмотреть результат`)

  return times
}


const pushPoll = (chatId, name, eventTime) => {
  try {
    eventTime
    bot.telegram.sendPoll(chatId, `Друзья, во сколько сегодня ${name}`, generateOptionsByTime(eventTime), {
      is_anonymous: false
    })
    console.log('Опрос отправил успешно')
  } catch (err) {
    console.error(err)
  }
}

function formatDate(rawDate) {
  const date = new Date(rawDate);
  
  try {
    const formatedDate = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

    return formatedDate;
  } catch (err) {
    return '';
  }
}


module.exports = {
  parseAddRecurrentMessage,
  pushPoll,
  formatDate,
}
