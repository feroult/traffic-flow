const assert = require('chai').assert;

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

    let events;

    const emitter = (vehicle, position) => {
        events.push({vehicle, position});
    };

    beforeEach(() => {
        events = [];
    });

    it('has even stretch lengths', () => {
        const road = new Road(completeRoadAttrs);
        assert.equal(2, road.stretchesLength);
    });

    it('simulates one vehicle on a simple road', (done) => {
        const road = new Road({
            length: 100,
            sleep: 1,
            fastForward: 1000 * 60 * 3,
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
            var lastIndex = events.length - 1;
            assert.isAbove(lastIndex, 0);
            assert.isAtLeast(events[lastIndex].position.distance, 100);
            done();
        });
    });

});