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
  let hourStart = time.getUTCHours() + 3
  let minutesStart = Math.round(time.getUTCMinutes() / 30) * 30
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

// Кейсы

// Что-то как-то вы неактивно 🤷‍♀️
// Больше всего людей идёт в 13:30
// Больше всего людей идёт в 13:30, 14:00
// Больше всего людей идёт в 13:30. Но можно сходить в 15: 30, 16:00
// Больше всего людей идёт в 13:30, 14:00. Но можно сходить в 15: 30, 16:00
function formatPollAnswer(ctx) {
  const sortedOptions = ctx.poll.options
    .filter(({voter_count}) => voter_count >= Number(process.env.MIN_VOICES))
    .sort((a, b) => {
      if (a.voter_count > b.voter_count) {
        return -1;
      }

      if (a.voter_count < b.voter_count) {
        return 1;
      }

      return 0;
    });

  if (sortedOptions.length === 0) {
    return 'Что-то как-то вы неактивно 🤷‍♀️';
  }

  const firstOption = sortedOptions[0];
  const withMaxResult = sortedOptions.filter(({voter_count}) => voter_count === firstOption.voter_count);
  const restResult = sortedOptions.filter(({voter_count}) => voter_count < firstOption.voter_count)

  const resultText = `Больше всего людей идёт в ${withMaxResult.map(({text}) => text).join(', ')}`;
  const restText = restResult.length ? `. Но можно сходить в ${restResult.map(({text}) => text).join(', ')}` : '';

  return resultText + restText;
}


module.exports = {
  parseAddRecurrentMessage,
  pushPoll,
  formatDate,
  formatPollAnswer,
}
