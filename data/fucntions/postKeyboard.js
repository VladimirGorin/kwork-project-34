const {token, channelID, adminID} = require("../settings.js")


module.exports.getPostKeyboard = (bot, users) => {
    for(let key in users){
        if(users[key].postText != null){
            const postKeyboard = {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{text: 'Опубликовать пост', callback_data: `postVerifyKeyboard_${users[key].id}`}],
                        [{text: 'Отклонить пост', callback_data: `postVerifyKeyboard_2_${users[key].id}`}]
            
                    ]
                })
            }
    
            console.log(users[key].nick);
            bot.sendMessage(adminID, `Запрос на отправку поста от ${users[key].nick}\nТекст:${users[key].postText}`, postKeyboard)
        }
    }

    
}