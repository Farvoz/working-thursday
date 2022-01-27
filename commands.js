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
    'enableExtraForMe': {
        'description': 'enableExtraForMe',
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