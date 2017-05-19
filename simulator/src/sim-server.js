#!/usr/bin/env node

const dnode = require('dnode');
const Road = require('./road');
const Vehicle = require('./vehicle');

let argv = require('./options')(true);

remoteControlServerSetup();

const bandeirantes = Road.loadConfig('./data/bandeirantes');
bandeirantes.sleep = getSleep;
bandeirantes.fastForward = getFastForward;

const road = new Road(bandeirantes);

let intervalId = setInterval(spawn, argv.interval / getFastForward());

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
        intervalId = setInterval(spawn, argv.interval / getFastForward());
    };

    const updateParams = function (newArgv) {
        const willUpdateInterval = newArgv.interval && argv.interval !== newArgv.interval;
        const willUpdateSleep = newArgv.sleep && argv.sleep !== newArgv.sleep;
        const willUpdateFastForward = newArgv.fast && argv.fast !== newArgv.fast;

        Object.assign(argv, newArgv);

        if (willUpdateFastForward) {
            updateInterval();
            updateSleep();
        } else {
            willUpdateInterval && updateInterval();
            willUpdateSleep && updateSleep();
        }
    };

    const changeRoad = (newArgv) => {
        const changeStr = newArgv['change-road'];
        if (!changeStr) {
            return;
        }

        console.log("c", changeStr);
        const change = JSON.parse(changeStr);
        console.log('changeStr', change);
    };

    const server = dnode({
        control: function (newArgv) {
            console.log('----> remote control');
            updateParams(newArgv);
            changeRoad(newArgv);
        }
    });

    server.listen(argv.port);
}

function getSleep() {
    return argv.sleep;
}

function getFastForward() {
    return argv['fast-forward'];
}