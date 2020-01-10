const rp = require('request-promise');

class Position {
    constructor(json) {
        this.lat = json.lat;
        this.lon = json.lon;
        this.country = "";
        this.state = "";
        this.county = "";
        this.city = "";
        this.road = "";
        this.osmid = json.osm_id;
        if (json.address) {
            this.country = json.address.country; // paese
            this.state = json.address.state; // regione
            this.county = json.address.county; // provincia
            this.city = json.address.city; // comune
            this.road = json.address.road; // via
            this.osmid = json.osm_id;
        }
    }
}

module.exports.requstPositionInfo = async function requstPositionInfo(lat, lon) {
    const options = {
        uri: 'https://nominatim.openstreetmap.org/reverse',
        qs: {
            lat: lat,
            lon: lon,
            format: 'json'
        },
        headers: {
            'User-Agent': 'Ballaro-app'
        },
        json: true // Automatically parses the JSON string in the response
    };
    let response = await rp(options);
    if (response.error) {
        throw new Error(response.error);
    }
    return new Position(response);
};