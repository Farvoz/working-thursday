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
  getEventsForAllChats,
} = require('./db')

module.exports = {
    'id': {
        description: 'id',
        callback: async (ctx) => {
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
            /subscribe - 
            /showAvailable - Запрос событий, доступных пользователю
        `,
        callback: async (ctx, command) => {
            ctx.telegram.sendMessage(ctx.message.chat.id, command.description)
        }
    },
    'help': {
        'description': 'Помощь',
        callback: async () => (ctx, command) => {
            ctx.telegram.sendMessage(ctx.message.chat.id, command.description)
        }
    },
    'addRecurrent': {
        'description': 'addRecurrent',
        callback: async (ctx) => {
            const chatId = ctx.message.chat.id

            // /addRecurrent 22:00 late night hack
            const message = ctx.message.text
          
            const {
              name,
              eventTime,
            } = parseAddRecurrentMessage(message)

            const time = new Date(eventTime + ' 1 1 1970 GMT+3')
          
            await createEvent(
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
        callback: async () => ({})
    },
    'stopList': {
        'description': 'stopList',
        callback: async () => ({})
    },
    'stop': {
        'description': 'stop',
        callback: async () => ({})
    },
    'stopAll': {
        'description': 'stopAll',
        callback: async () => ({})
    },
    'subscribe': {
        'description': 'subscribe',
        callback: async (ctx) => {
            const chatId = ctx.message.chat.id
            const userId = ctx.message.from.id
          
            addChatForUser(userId, chatId)
        }
    },
    'showAvailable': {
        'description': 'showAvailable',
        callback: async (ctx) => {
            const userId = ctx.message.from.id
            const chats = await getChatsForUser(userId) || [];
            const events = await getEventsForAllChats(chats)
            if (events.length === 0) {
                return ctx.reply(`У вас нет доступных событий`)
            }
            ctx.reply(`Список доступных событий:
                ${events.reduce('', (acc, el) => {
                    acc += (el.name + ': ' + el.time + '\n')
                    return acc 
                })}
            `)
        }
    }
}
