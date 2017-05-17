const argv = require('yargs')
    .option('vehicles', {
        alias: 'v',
        describe: 'vehicles arriving in each interval',
        default: 2
    })
    .option('interval', {
        alias: 'i',
        describe: 'interval (ms) to enter new vehicles',
        default: 1000,
    })
    .option('min-velocity', {
        alias: 'min',
        describe: 'mininum target velocity for new vehicles',
        default: 80
    })
    .option('max-velocity', {
        alias: 'max',
        describe: 'maximum target velocity for new vehicles',
        default: 120
    })
    .options('sleep', {
        alias: 's',
        describe: 'vehicles interval (ms) time to emit events',
        default: 1000,
    })
    .option('fast-forward', {
        alias: 'fast',
        describe: 'fast forward multiplier',
        default: 1
    })
    .argv;

module.exports = argv;