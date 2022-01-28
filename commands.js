const {
    parseAddRecurrentMessage,
    parseAddOneMessage,
    formatPollAnswer,
    formatDate,
  } = require('./utils')
const {
  createEvent,
  getEventsForChat,
  deleteChatEvent,
  deleteAllChatEvents,
  getAllEvents,
  getChatsForUser,
  addChatForUser,
  getEventsForAllChats,
} = require('./db')

const DATA_ERROR = 'Ошибка данных. Попробуйте позже';
const COMMON_EXEPTION_MESSAGE = 'Что-то не так. Попробуйте /help';

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
        callback: async (ctx) => {
            const chatId = ctx.message.chat.id

            // /addOne 22:00 late night hack
            const message = ctx.message.text
          
            const {
              name,
              eventTime,
            } = parseAddOneMessage(message)

            const time = new Date(eventTime + ' 1 1 1970 GMT+3')
          
            await createEvent(
              chatId,
              name,
              time,
              false,
            )
          
            ctx.reply(`Создано событие ${name} на ${eventTime}`)
        }
    },
    'stopList': {
        'description': 'stopList',
        callback: async () => ({})
    },
    'showEvents': {
        'description': 'Получить список ивентов',
        callback: async (ctx) => {
            getEventsForChat(ctx.message.chat.id).then((data) => {
                return data.map(({
                id,
                name,
                eventTime,
                }) => `${id} — [${formatDate(eventTime)}]: ${name}`);
            }).then((eventList) => {
                if (eventList.length) {
                ctx.telegram.sendMessage(ctx.message.chat.id, eventList.join('\n'))
                } else {
                ctx.telegram.sendMessage(ctx.message.chat.id, 'Пока нет ни одного события')
                }
            }).catch((err) => {
                ctx.telegram.sendMessage(ctx.message.chat.id, DATA_ERROR)
            });
        }
    },
    'stop': {
        'description': 'stop',
        callback: async (ctx) => {
            const idToStopPattern = /\/stop (\S*)/;

            try {
                const idToStop = ctx.message.text.match(idToStopPattern)[1];
                deleteChatEvent(ctx.message.chat.id, idToStop).then((data) => {
                if (data && !data.deletedCount) {
                    throw '(';
                }

                ctx.telegram.sendMessage(ctx.message.chat.id, 'Успех 👍')
                }).catch((err) => {
                ctx.telegram.sendMessage(ctx.message.chat.id, 'Не получилось 🥲');
                });
            } catch (err) {
                ctx.telegram.sendMessage(ctx.message.chat.id, COMMON_EXEPTION_MESSAGE);
            }
        }
    },
    'stopAll': {
        'description': 'stopAll',
        callback: async (ctx) => {
            try {
                deleteAllChatEvents(ctx.message.chat.id).then((data) => {
                if (data && !data.deletedCount) {
                    throw '(';
                }

                ctx.telegram.sendMessage(ctx.message.chat.id, 'Успех 👍')
                }).catch((err) => {
                ctx.telegram.sendMessage(ctx.message.chat.id, 'Не получилось 🥲');
                });
            } catch (err) {
                ctx.telegram.sendMessage(ctx.message.chat.id, COMMON_EXEPTION_MESSAGE);
            }
        }
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
