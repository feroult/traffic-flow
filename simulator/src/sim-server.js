#!/usr/bin/env node

const dnode = require('dnode');
const Road = require('./road');
const Vehicle = require('./vehicle');

let argv = require('./options');

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

function remoteControlServerSetup() {
    const updateInterval = function (newArgv) {
        if (argv.interval !== newArgv.interval) {
            clearInterval(intervalId);
            setInterval(spawn, newArgv.interval);
        }
    };

    const server = dnode({
        control: function (newArgv) {
            console.log('----> remote control');
            updateInterval(newArgv);
            argv = newArgv;
        }
    });
    
    server.listen(argv.port);
}