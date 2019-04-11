const request = require('request')

class Request {

    static nearbySearch(lat, lng) {
        return new Promise((resolve, reject) => {
            request({
                url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                qs: {    
                    location: `${lat}, ${lng}`,
                    type: "parking",
                    rankby: "distance",
                    language: "zh-TW",
                    key: process.env.API_KEY
                }

            }, (err, res, body) => {
                if (err) return reject(err)

                try {
                    let jsonBody = JSON.parse(body)

                    if (jsonBody.status === "OK") {
                        let result = jsonBody.results.map(p => {
                            // if no photos, assign photo_reference to null to prevent error
                            let photo = p.photos ? p.photos[0] : { photo_reference: null }
                            return {
                                lat: p.geometry.location.lat,
                                lng: p.geometry.location.lng,
                                name: p.name,
                                photoReference: photo.photo_reference,
                                address: p.vicinity
                            }
                        })
                        return result.length > 10 ? resolve(result.splice(0, 10)) : resolve(result)
                    }

                } catch (err) {
                    return reject(err)
                }
            })
        })
    }

    static getImage(photoReference) {
        return new Promise((resolve, reject) => {
            if (photoReference) {
                request({
                    url: "https://maps.googleapis.com/maps/api/place/photo",
                    qs: {
                        maxwidth: 400,
                        photoreference: photoReference,
                        key: process.env.API_KEY
                    }
                }, (err, res, body) => {
                    if (err) return reject(err)
                    return resolve(res.request.href)
                })

            } else {
                resolve('https://i.imgur.com/BB1QtxU.png')
            }
        })
    }

    static getDistanceAndDuration(origin, destination) {
        return new Promise((resolve, reject) => {
            request({
                url: "https://maps.googleapis.com/maps/api/distancematrix/json",
                qs: {
                    origins: origin,
                    destinations: destination,
                    key: process.env.API_KEY
                }
            }, (err, res, body) => {
                if (err) return reject(err)
                
                try {
                    let jsonBody = JSON.parse(body)
                    if (jsonBody.status === "OK") {
                        return resolve({
                            distance: jsonBody.rows[0].elements[0].distance.value,
                            duration: jsonBody.rows[0].elements[0].duration.text
                        })
                    }

                } catch(err) {
                    return reject(err)
                }
            })
        })
    } 
}


module.exports = Request