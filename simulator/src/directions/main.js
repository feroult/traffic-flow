const dir = require('./get-directions.js');
const fs = require('fs');

const options = {
    origin: '-23.256400, -47.152858',
    destination: '-23.176450, -46.936513'
};

// bandeirantes
// origin: '-22.997975, -47.103343',
// destination: '-23.513111, -46.680075'


// anhanguera
// -22.985593, -47.041721
// -23.516913, -46.739962

// dom grabriel

// -23.256400, -47.152858
// -23.176450, -46.936513

// andradas
// -22.990181, -46.990767
// -23.156796, -46.911631


dir.saveDataToFile('data.json', options, data => {
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
    console.log('9', dir.interpolate(data, 0.09 * max));
    console.log('10', dir.interpolate(data, 0.10 * max));
    console.log('50', dir.interpolate(data, 0.50 * max));
    console.log('99', dir.interpolate(data, 0.99 * max));
    console.log('100', dir.interpolate(data, 1 * max));

});
