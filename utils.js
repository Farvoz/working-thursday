const testRecurrentString = `"/addRecurrent 22:00 y late night hack`

// console.log(parseAddRecurrentMessage(testRecurrentString))

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
  const withoutTime = withoutCommand.substring(timeIndex + eventTime.length).trim()

  const atWeekend = withoutTime[0] === 'y'

  const name = withoutTime.substring(2)

  return {
    name,
    eventTime,
    atWeekend,
  }
}

const pushPoll = (chatId, time) => {
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
  try {
    bot.telegram.sendPoll(chatId, 'Друзья, во сколько сегодня пойдем кушать?', options, {
      is_anonymous: false
    })
    console.log('Опрос отправил успешно')
  } catch (err) {
    console.error(err)
  }
}


module.exports = {
  parseAddRecurrentMessage,
  pushPoll,
}
