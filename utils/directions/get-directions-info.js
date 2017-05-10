const config = require('./config');

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
        // console.log(response.json.routes[0]);
        const points = response.json.routes[0].overview_polyline.points;
        console.log(polyline.decode(points));
        console.log(points)
    } else {
        console.log('err', err);
    }

});
