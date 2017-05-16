const assert = require('assert');

const Road = require('../road');
const Vehicle = require('../vehicle');

const attrs = {
    length: 10,
    sleep: 1,
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

describe('Road', () => {

    let road;
    let positions;

    const emitter = (vehicle, position) => {
        positions.push({vehicle, position});
    };

    beforeEach(() => {
        road = new Road(attrs);
        positions = [];
    });

    it('has even stretch lengths', () => {
        assert.equal(2, road.stretchesLength);
    });

    it('simulates one vehicle', (done) => {
        const vehicle = new Vehicle({
            targetVelocity: 100,
            length: 3,
            emitter: emitter
        });

        road.addVehicle(vehicle);

        road.finish(() => {
            assert.ok(positions.length > 0);
            done();
        });
    });

});