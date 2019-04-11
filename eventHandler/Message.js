const Request = require('../lib/Request')

const shareLocation = require('../reply/shareLocation.json')
const flexTemplate = require('../reply/flexTemplate.json')

module.exports = async event => {

    switch (event.message.type) {

        case "text" :
            if (event.message.text === "查詢附近停車場") {
                event
                    .reply(shareLocation)
                    .then(data => console.log(data))
                    .catch(err => console.log(err))
            } else {
                event
                    .reply(event.message.text)
                    .then(data => console.log(data))
                    .catch(err => console.log(err))
            }
            break

        case "location" :
            try {
                let lat = event.message.latitude
                let lng = event.message.longitude
                let parkingList = await Request.nearbySearch(lat, lng)
                let promiseTask = parkingList.map(async p => {
                    try {
                        let distanceAndDuration = await Request.getDistanceAndDuration(`${lat},${lng}`, `${p.lat},${p.lng}`)
                        let href = await Request.getImage(p.photoReference)

                        p['distance'] = distanceAndDuration.distance
                        p['duration'] = distanceAndDuration.duration
                        p['imgHref'] = href
                        p['status'] = "OK"
                        return p

                    } catch (err) {
                        p['status'] = "error"
                        return p
                    }
                })

                Promise
                    .all(promiseTask)
                    .then(result => {
                        let flexContents = result
                                            .filter(r => r.status === "OK" && r.distance <= 1000)
                                            .sort((a, b) => { return a.distance - b.distance })
                                            .map(r => {
                                                let ft = JSON.parse(JSON.stringify(flexTemplate))
                                                ft.hero.url = r.imgHref
                                                ft.body.contents[0].text = r.name
                                                ft.body.contents[1].contents[0].contents[1].text = r.address
                                                ft.body.contents[1].contents[1].contents[1].text = `${r.distance}公尺`
                                                ft.body.contents[1].contents[2].contents[1].text = r.duration
                                                ft.footer.contents[0].action.uri = `https://www.google.com.tw/maps/dir/${lat},${lng}/${r.lat},${r.lng}?mode=driving`

                                                return ft
                                            })
                        if (flexContents.length === 0) {
                            event
                                .reply('附近一公里內查無停車場')
                                .then(data => console.log(data))
                                .catch(err => console.log(err))  
                                
                        } else {
                            let parkingFlexMsg = {
                                "type": "flex",
                                "altText": "在您周邊的停車場",
                                "contents": {
                                    "type": "carousel",
                                    "contents": flexContents
                                }
                            }
    
                            event
                                .reply(parkingFlexMsg)
                                .then(data => console.log(data))
                                .catch(err => console.log(err))  
                        }     
                    })

            } catch (err) {
                console.log(err)
                event
                    .reply('暫無搜尋結果，請稍後再試')
                    .then(data => console.log(data))
                    .catch(err => console.log(err))
            }

        default :
         
    }

}