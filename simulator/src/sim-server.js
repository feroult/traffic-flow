#!/usr/bin/env node

const dnode = require('dnode');
const fs = require('fs');

const publish = require('./pubsub/publish');

const Road = require('./road');
const Vehicle = require('./vehicle');

let argv = require('./options')(true);

remoteControlServerSetup();

const bandeirantes = Road.loadConfig('./data/bandeirantes');
bandeirantes.sleep = getSleep;
bandeirantes.fastForward = getFastForward;

const road = new Road(bandeirantes);

let intervalId = setInterval(addVehicles, argv.interval / getFastForward());
addVehicles();

function moveVehicles() {
    road.moveVehicles();
    setTimeout(moveVehicles, argv.sleep / getFastForward())
}
moveVehicles();

function emitter(vehicle) {

    const info = road.getPoint(vehicle.distance, vehicle.segmentIndex);
    const point = info.point;
    vehicle.segmentIndex = info.segmentIndex;

    const event = {
        type: 'VEHICLE',
        simulationId: road.simulationId,
        vehicleId: vehicle.id,
        timestamp: new Date().getTime(),
        speed: vehicle.velocity,
        lat: point[0],
        lng: point[1]
    };

    if (isVerbose()) {
        // console.log('Event ->', event.vehicleId, event.timestamp, event.velocity, [point[0], point[1]]);
    }

    publish(argv, event).catch(err => {
        // console.log('Error publishing', err);
    });
}

function randomTargetVelocity() {
    var min = argv['min-velocity'];
    var max = argv['max-velocity'];
    return Math.floor(Math.random() * (max - min)) + min;
}

function addVehicles() {
    for (let i = 0; i < argv.vehicles; i++) {
        const vehicle = new Vehicle({
            targetVelocity: randomTargetVelocity(),
            length: 4,
            emitter: emitter
        });
        road.addVehicle(vehicle);
    }

    if (isVerbose()) {
        console.log(`Added ${argv.vehicles} new vehicles. Road total: ${road.vehiclesCount}.`);
    }
}

function remoteControlServerSetup() {
    const updateSleep = function () {
        road.resetSleepTimeout();
    };

    const updateInterval = function () {
        clearInterval(intervalId);
        intervalId = setInterval(addVehicles, argv.interval / getFastForward());
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

        try {
            const change = JSON.parse(changeStr);
            road.change(change);
        } catch (err) {
            console.log('invalid json');
        }
    };

    const resetRoad = (newArgv) => {
        const reset = newArgv['reset-road'];
        if (!reset) {
            return;
        }

        road.reset();
    };

    const debug = (newArgv) => {
        const showDebug = newArgv['debug'];
        if (!showDebug) {
            return;
        }

        fs.writeFile(`/tmp/sim.debug`, JSON.stringify(road.stretches, null, 4));
    };


    const server = dnode({
        control: function (newArgv) {
            console.log('----> remote control');
            updateParams(newArgv);
            changeRoad(newArgv);
            resetRoad(newArgv);
            debug(newArgv);
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

function isVerbose() {
    return argv.verbose && argv.verbose !== 'false';
}
