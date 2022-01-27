const {
    parseAddRecurrentMessage,
  } = require('./utils')
const {
  createEvent,
  getEventsForChat,
  deleteEventsForChat,
  getAllEvents,
  getChatsForUser,
  addChatForUser,
} = require('./db')

module.exports = {
    'id': {
        description: 'id',
        callback: (ctx) => {
            ctx.telegram.sendMessage(ctx.message.chat.id, `Your id: ${ctx.message.chat.id}`)
        }
    },
    'start': {
        'description': `
            Привет! Я бот любящий поесть и выпить. Я буду тебе очень полезен.
            /help - Справка
            /addRecurrent<event> - Создать событие в формате
            /addOne<time> - Создать событие в формате
            /stop - 
            /stop<id> - 
            /stopAll -
            /enableExtraForMe - 
            /showAvailable - Запрос событий, доступных пользователю
        `,
        callback: (ctx, command) => {
            ctx.telegram.sendMessage(ctx.message.chat.id, command.description)
        }
    },
    'help': {
        'description': 'Помощь',
        callback: () => (ctx, command) => {
            ctx.telegram.sendMessage(ctx.message.chat.id, command.description)
        }
    },
    'addRecurrent': {
        'description': 'addRecurrent',
        callback: (ctx) => {
            const chatId = ctx.message.chat.id

            // /addRecurrent 22:00 late night hack
            const message = ctx.message.text
          
            const {
              name,
              eventTime,
            } = parseAddRecurrentMessage(message)

            const time = new Date(eventTime + ' 1 1 1970 GMT+3')
          
            createEvent(
              chatId,
              name,
              time,
              true,
            )
          
            ctx.reply(`Создано событие ${name} на ${eventTime}`)
        }
    },
    'addOne': {
        'description': 'addOne',
        callback: () => ({})
    },
    'stopList': {
        'description': 'stopList',
        callback: () => ({})
    },
    'stop': {
        'description': 'stop',
        callback: () => ({})
    },
    'stopAll': {
        'description': 'stopAll',
        callback: () => ({})
    },
    'subscribe': {
        'description': 'subscribe',
        callback: (ctx) => {
            const chatId = ctx.message.chat.id
            const userId = ctx.message.from.id
          
            addChatForUser(userId, chatId)
          }
    },
    'showAvailable': {
        'description': 'showAvailable',
        callback: () => ({})
    }
}
