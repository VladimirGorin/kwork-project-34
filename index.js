const TelegramBotApi = require('node-telegram-bot-api')
const {token, channelID, adminID} = require("./data/settings.js")
const bot = new TelegramBotApi(token, { polling: true })
const users = require('./data/base/users.json')
const channels = require('./data/base/channels.json')
const {getPostKeyboard} = require("./data/fucntions/postKeyboard.js")

const fs = require('fs');

function prettify(number) {
    return String(number).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, "$1 ").replace(/\s/g, '.')
}

setInterval(() => {
    require('fs').writeFileSync('./data/base/users.json', JSON.stringify(users, null, '\t'))
}, 9000)

setInterval(() => {
    require('fs').writeFileSync('./data/base/channels.json', JSON.stringify(channels, null, '\t'))
}, 9000)


bot.setMyCommands([
    { command: '/start', description: 'Начать' }
])

bot.on('message', msg => {
    var user = users.filter(x => x.id === msg.from.id)[0]
    if (!user) {
        users.push({
            id: msg.from.id,
            nick: msg.from.username,
            postText: null
        })
        user = users.filter(x => x.id === msg.from.id)[0]
    }
})

const startKeyboard = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: 'Опубликовать пост', callback_data: `startKeyboard1` }],

        ]
    })
}

function getForm (msg) {
    var user = users.filter(x => x.id === msg.from.id)[0]
    let chatId = msg.chat.id
    let message = `Отлично! Пост был успешно отправлен на модерацию`
    let text = msg.text
    user.postText = text

    let requests = JSON.parse(fs.readFileSync('./data/base/users.json'));
    getPostKeyboard(bot, requests)
    //bot.sendMessage(adminID, `Пользователь ${msg.from.username} хочет отправить свой пост на канал:\n${text}`, postVerifyKeyboard)
    bot.sendMessage(chatId, message);
    bot.removeListener("message", getForm);
};

bot.on("message", msg => {
    var user = users.filter(x => x.id === msg.from.id)[0]
    let chatId = msg.chat.id
    let text = msg.text

    if (text == "/start"){
        bot.sendMessage(chatId, "Приветствую! В данном боте ты можешь опубликовать пост который будет опубликован на канале!", startKeyboard)
       
    }
})

bot.on("channel_post", msg => {
    
    channels.push({
        channel: {
            id: msg.chat.id
        }
    })
})

bot.on("callback_query", msg => {
    var user = users.filter(x => x.id === msg.from.id)[0]
    let chatId = msg.from.id
    let data = msg.data
    let requests = JSON.parse(fs.readFileSync('./data/base/users.json'));

    if(data == "startKeyboard1"){
        bot.on("message", getForm);
        bot.sendMessage(chatId, "Введите текст который вы хотите опубликовать на канал \n Пример: Это мой первый пост на этот телеграмм канал");
    }  

    if(user.id == adminID){
        for(let key in requests){
            if(data == `postVerifyKeyboard_${requests[key].id}`){
                bot.sendMessage(channelID, requests[key].postText)
                bot.sendMessage(adminID, "Пост был опубликован!")
                bot.sendMessage(requests[key].id, "Ваш пост был принят!")
            }
            if(data == `postVerifyKeyboard_2_${requests[key].id}`){
                bot.sendMessage(requests[key].id, "Ваш пост был отклонен!")
                bot.sendMessage(adminID, "Пост был отклонен")
            }
        }  
    }


})



bot.on("polling_error", console.log);