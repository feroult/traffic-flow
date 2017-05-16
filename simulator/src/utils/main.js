const dir = require('./get-directions.js');
const fs = require('fs');

dir.saveDataToFile('data.json', data => {
    let max = dir.maxDistance(data);
    console.log('0.2', dir.interpolate(data, 0.2 * max));
    console.log('0.6', dir.interpolate(data, 0.6 * max));
});
