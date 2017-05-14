const assert = require('assert');

const Simulator = require('../simulator');
const Road = require('../road');
const Vehicle = require('../vehicle');

const roadAttrs = {
    length: 10,
    stretches: [{
        velocity: 40,
        lanes: 2
    }, {
        velocity: 100,
        lanes: 3
    }, {
        velocity: 100,
        lanes: 4
    }, {
        velocity: 80,
        lanes: 3
    }, {
        velocity: 40,
        lanes: 2
    }]
};

describe('Simulator', () => {

    it('simulates one vehicle', (done) => {
        const road = new Road(roadAttrs);
        const sim = new Simulator(road);

        const vehicle = new Vehicle({
            targetVelocity: 100,
            length: 3
        });

        sim.enterVehicle(vehicle);

        sim.run().then(() => {
            assert.ok(true);
            done();
        });
    });

});