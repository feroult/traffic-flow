const config = require('../config/config.js');
const fs = require('fs');

const polyline = require('@mapbox/polyline');
const googleMaps = require('@google/maps').createClient({
    key: config.key
});

const sq = x => x * x;
const dist = (p1, p2) => Math.sqrt(sq(p1[0] - p2[0]) + sq(p1[1] - p2[1]));

const extractData = cb => {
    googleMaps.directions({
        // origin: 'Campinas',
        // destination: 'Sao Paulo',
        origin: '-22.997975, -47.103343',
        destination: '-23.513111, -46.680075',
        mode: 'driving'
    }, (err, response) => {

        if (!err) {
            console.log('r', response)
            const points = response.json.routes[0].overview_polyline.points;

            console.log('points', points);

            const decoded = polyline.decode(points);
            let sum = 0;
            const parsed = decoded.map((point, i) => {
                sum += i == 0 ? 0 : dist(decoded[i - 1], point);
                return {point, accSum: sum};
            });
            cb({points: parsed});
        } else {
            console.log('err', err);
        }
    });
};

const saveDataToFile = (file, cb) => extractData(parsed => {
    fs.writeFileSync(file, JSON.stringify(parsed));
    cb(parsed);
});

const readDataFromFile = file => {
    return JSON.stringify(fs.readFileSync(file, 'utf-8'));
};

const maxDistance = ({points}) => points[points.length - 1].accSum;

const interpolate = ({points}, x, segmentIndex) => {
    let i, p0, p1;

    segmentIndex = segmentIndex | 0;

    for (i = segmentIndex; i < points.length; i++) {
        const segment = points[i];
        if (segment.accSum >= x) {
            p0 = points[i - 1];
            p1 = segment;
            break;
        }
    }

    if (!p0 && (points[points.length - 1].accSum + 0.0001 > x)) {
        p0 = points[points.length - 2];
        p1 = points[points.length - 1];
    }

    let totalDist = dist(p0.point, p1.point);

    const interpolateFactor = (x - p0.accSum) / totalDist;

    const x1 = p0.point[1] + interpolateFactor * (p1.point[1] - p0.point[1]);
    const y1 = p0.point[0] + interpolateFactor * (p1.point[0] - p0.point[0]);


    return {segmentIndex: i, point: [y1, x1]};
};

module.exports = {saveDataToFile, readDataFromFile, extractData, maxDistance, interpolate};
