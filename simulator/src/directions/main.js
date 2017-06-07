const dir = require('./get-directions.js');
const fs = require('fs');

dir.saveDataToFile('data.json', data => {
    let max = dir.maxDistance(data);
    // console.log('0.3', dir.interpolate(data, 0.3 * max));
    // -23.057986, -47.044828
    // console.log('1nd pedagio', dir.interpolate(data, 0.112 * max));
    // console.log('1nd pedagio', dir.interpolate(data, 0.125 * max));
    //
    // //-23.347011, -46.813391
    // console.log('2nd pedagio', dir.interpolate(data, 0.655 * max));
    // console.log('2nd pedagio', dir.interpolate(data, 0.664 * max));
    //
    // console.log('inicio sampa', dir.interpolate(data, 0.935 * max));

    console.log('1', dir.interpolate(data, 0.01 * max));
    console.log('10', dir.interpolate(data, 0.10 * max));
    console.log('50', dir.interpolate(data, 0.50 * max));
    console.log('10', dir.interpolate(data, 1 * max));

});
