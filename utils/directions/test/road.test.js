const assert = require('assert');

const Road = require('../road');
const Vehicle = require('../vehicle');

const completeRoadAttrs = {
    length: 10,
    sleep: 1,
    fastForward: 1000 * 60 * 6,
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

    let positions;

    const emitter = (vehicle, position) => {
        // console.log('p', position);
        positions.push({vehicle, position});
    };

    beforeEach(() => {
        positions = [];
    });

    it('has even stretch lengths', () => {
        const road = new Road(completeRoadAttrs);
        assert.equal(2, road.stretchesLength);
    });

    it('simulates one vehicle on a simple road', (done) => {
        const road = new Road({
            length: 100,
            sleep: 1,
            fastForward: 1000 * 60 * 2,
            stretches: [{
                vehicle: 100,
                lanes: 1
            }]
        });

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