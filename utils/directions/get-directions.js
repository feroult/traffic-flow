const config = require('./config');
const fs = require('fs');

const googleMaps = require('@google/maps').createClient({
    key: config.key
});

const polyline = require('@mapbox/polyline');

// // Geocode an address.
// googleMaps.geocode({
//     address: 'Campinas'
// }, function (err, response) {
//     if (!err) {
//         console.log(response.json.results);
//     } else {
//         console.log('err', err);
//     }
// });

googleMaps.directions({
    origin: 'Campinas',
    destination: 'Sao Paulo',
    mode: 'driving'
}, (err, response) => {

    if (!err) {
        const points = response.json.routes[0].overview_polyline.points;
        const decoded = polyline.decode(points);
    let sum = 0;
        const parsed = decoded.map((point, i) => {
        sum += i == 0 ? 0 : dist(decoded[i - 1], point);
        return { point, accSum : sum };
    });
    fs.writeFileSync('data.json', JSON.stringify(parsed));
    } else {
        console.log('err', err);
    }

});

const sq = x => x * x;
const dist = (p1, p2) => Math.sqrt(sq(p1[0] - p2[0]) + sq(p1[1] - p2[1]));
