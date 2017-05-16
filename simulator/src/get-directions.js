const config = require('./config');
const fs = require('fs');
const ls = require('linear-solve');

const polyline = require('@mapbox/polyline');
const googleMaps = require('@google/maps').createClient({
    key: config.key
});

const sq = x => x * x;
const dist = (p1, p2) => Math.sqrt(sq(p1[0] - p2[0]) + sq(p1[1] - p2[1]));

const extractData = cb => {
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
            cb(parsed);
        } else {
            console.log('err', err);
        }
    });
};

const saveDataToFile = (file, cb) => extractData(parsed => {
    fs.writeFileSync(file, JSON.stringify(parsed))
    cb(parsed);
});

const readDataFromFile = file => {
    return JSON.stringify(fs.readFileSync(file, 'utf-8'));
};

const maxDistance = data => data[data.length - 1].accSum;

const interpolate = (data, x) => {
    let p0, p1;
    data.some((segment, i) => {
        if (segment.accSum > x) {
            p0 = data[i - 1];
            p1 = segment;
            return true;
        }
    });
    let diff = x - p0.accSum;
    let totalDist = dist(p0.point, p1.point);
    let x0 = p0.point[0], x1 = p1.point[0], y0 = p0.point[1], y1 = p1.point[1];
    let fit = ls.solve([[x0, 1], [x1, 1]], [y0, y1]);
    let fitfn = x => x*fit[0] + fit[1];
    let interpolatedX = x0 + diff * Math.cos(Math.atan2(y1 - y0, x1 - x0));
    return [ interpolatedX, fitfn(interpolatedX) ];
};

module.exports = { saveDataToFile, readDataFromFile, extractData, maxDistance, interpolate };
