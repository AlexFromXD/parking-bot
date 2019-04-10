console.log('=== app is working ===')

const linebot = require('linebot')
const bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

const shareLocation = require('./reply/shareLocation.json')

bot.on('message', event => {
    if (event.message.type === "text") {
        console.log(event.message.text)
        if (event.message.text === '查詢附近停車場') {
            event
                .reply(shareLocation)
                .then(data => console.log(data))
                .catch(err => console.log(err))

        } else {
            event.reply(event.message.text)
                .then(data => {
                    console.log(data)
                })
                .catch(err => {
                    console.log(err)
                })
        }

    } else if (event.message.type === "location") {
        event.reply({
            type: 'location',
            title: 'this place',
            address: event.message.address,
            latitude: event.message.latitude,
            longitude: event.message.longitude
        })
        .then(data => {
            console.log(data)
        })
        .catch(err => {
            console.log(err)
        })
    }

    
})

bot.listen('/', process.env.PORT || 3000)