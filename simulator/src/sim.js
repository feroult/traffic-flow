#!/usr/bin/env node

const Road = require('./road');
const Vehicle = require('./vehicle');

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


const stretches = [];
for (let i = 0; i < 100; i++) {
    stretches.push({
        velocity: 120,
        lanes: 5
    });
}

const road = new Road({
    length: 100,
    sleep: argv.sleep,
    fastForward: argv['fast-forward'],
    stretches: stretches
});

let intervalId = setInterval(spawn, argv.interval);

function emitter(vehicle) {
    // console.log('v', vehicle.id, vehicle.distance, vehicle.velocity, vehicle.stretchIndex);
}

function randomTargetVelocity() {
    return Math.floor(Math.random() * argv['max-velocity']) + argv['min-velocity'];
}

function spawn() {
    for (let i = 0; i < argv.vehicles; i++) {
        const vehicle = new Vehicle({
            targetVelocity: randomTargetVelocity(),
            length: 4,
            emitter: emitter
        });
        road.addVehicle(vehicle);
    }

    console.log(`Added ${argv.vehicles} new vehicles. Road total: ${road.vehicles}.`);
}
