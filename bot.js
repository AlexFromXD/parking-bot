const linebot = require('linebot')

const messageHandler = require('./eventHandler/Message')

const bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.on('message', messageHandler)

bot.listen('/', process.env.PORT || 3000)