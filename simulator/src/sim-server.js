#!/usr/bin/env node

const dnode = require('dnode');
const Road = require('./road');
const Vehicle = require('./vehicle');

let argv = require('./options')(true);

remoteControlServerSetup();

const stretches = [];
for (let i = 0; i < 100; i++) {
    stretches.push({
        velocity: 120,
        lanes: 5
    });
}

const road = new Road({
    length: 100,
    sleep: getSleep,
    fastForward: argv['fast-forward'],
    stretches: stretches
});

let intervalId = setInterval(spawn, argv.interval);

function emitter(vehicle) {
    console.log('v', vehicle.id, vehicle.distance, vehicle.velocity, vehicle.stretchIndex);
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

    console.log(`Added ${argv.vehicles} new vehicles. Road total: ${road.vehiclesCount}.`);
}

function remoteControlServerSetup() {
    const updateSleep = function () {
        road.resetSleepTimeout();
    };

    const updateInterval = function () {
        clearInterval(intervalId);
        intervalId = setInterval(spawn, argv.interval);
    };

    const server = dnode({
        control: function (newArgv) {
            console.log('----> remote control');

            const willUpdateInterval = newArgv.interval && argv.interval !== newArgv.interval;
            const willUpdateSleep = newArgv.sleep && argv.sleep !== newArgv.sleep;

            Object.assign(argv, newArgv);
            willUpdateInterval && updateInterval();
            willUpdateSleep && updateSleep();
        }
    });

    server.listen(argv.port);
}

function getSleep() {
    return argv.sleep;
}