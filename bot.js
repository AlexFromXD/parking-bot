console.log('=== app is working ===')

const linebot = require('linebot')
const bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})


bot.on('message', event => {
    if (event.message.type === "text") {
        event.reply(event.message.text)
            .then(data => {
                console.log(data)
            })
            .catch(err => {
                console.log(err)
            })

    } else if (event.message.type === "location") {
        console.log(event)
    }

    
})

bot.listen('/', process.env.PORT || 3000)