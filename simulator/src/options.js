function configureOptions(yargs, options, withDefaults) {
    for (let key in options) {
        if (options.hasOwnProperty(key)) {
            if (!withDefaults && key !== 'port') {
                delete options[key]['default'];
            }
            yargs.option(key, options[key]);
        }
    }
}

function clearArgv(argv, withDefaults) {
    if (withDefaults) {
        return argv;
    }
    for (let key in argv) {
        if (argv.hasOwnProperty(key) && !argv[key]) {
            delete argv[key];
        }
    }
    return argv;
}

function parseOptions(withDefaults) {

    const options = {
        'vehicles': {
            alias: 'v',
            describe: 'vehicles arriving in each interval',
            default: 2
        },
        'interval': {
            alias: 'i',
            describe: 'interval (ms) to enter new vehicles',
            default: 1000,
        },
        'min-velocity': {
            alias: 'min',
            describe: 'mininum target velocity for new vehicles',
            default: 80
        },
        'max-velocity': {
            alias: 'max',
            describe: 'maximum target velocity for new vehicles',
            default: 120
        },
        'sleep': {
            alias: 's',
            describe: 'vehicles interval (ms) time to emit events',
            default: 1000,
        },
        'fast-forward': {
            alias: 'fast',
            describe: 'fast forward multiplier',
            default: 1
        },
        'port': {
            alias: 'p',
            describe: 'remote control server port',
            default: 5004
        }
    };

    const yargs = require('yargs');

    configureOptions(yargs, options, withDefaults);
    return clearArgv(yargs.argv, withDefaults);
}

module.exports = parseOptions;