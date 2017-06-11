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
        if (argv.hasOwnProperty(key) && argv[key] === undefined) {
            delete argv[key];
        }
    }
    return argv;
}

function parseOptions(withDefaults) {

    const options = {
        'vehicles': {
            alias: 've',
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
            default: 10000,
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
        },
        'change-road': {
            alias: 'c',
            describe: 'update stretch range i.e \'{"from": 0.1, "to": 0.2, "lanes": 3, "velocity": 100}\''
        },
        'reset-road': {
            alias: 'r',
            describe: 'reset road stretches'
        },
        'debug': {
            alias: 'd',
            describe: 'dump debug information'
        },
        'topic': {
            alias: 't',
            describe: 'Pub/Sub topic name to publish events',
            default: 'events'
        },
        'verbose': {
            alias: 'v',
            describe: 'print debug information to console',
            default: true
        }
    };

    const yargs = require('yargs');

    configureOptions(yargs, options, withDefaults);
    return clearArgv(yargs.help().argv, withDefaults);
}

module.exports = parseOptions;