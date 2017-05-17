const Road = require('./road');
const Vehicle = require('./vehicle');

const argv = require('yargs')
    .demandOption('vehicles')
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
    sleep: 1000,
    fastForward: 10,
    stretches: stretches
});

let count = 0;
let intervalId = setInterval(spawn, 100);

function emitter(vehicle) {
    console.log('v', vehicle.id, vehicle.distance, vehicle.velocity, vehicle.stretchIndex);
}

function spawn() {
    for (let i = 0; i < 5; i++) {
        const vehicle = new Vehicle({
            targetVelocity: 120,
            length: 4,
            emitter: emitter
        });
        road.addVehicle(vehicle);
        count++;
    }

    console.log('count', count);

    if (count >= argv.vehicles) {
        clearInterval(intervalId);
    }
}
