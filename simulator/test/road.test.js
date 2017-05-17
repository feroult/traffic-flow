const assert = require('chai').assert;

const Road = require('../src/road');
const Vehicle = require('../src/vehicle');

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

    const emitter = (vehicle) => {
        var event = {
            distance: vehicle.distance,
            time: vehicle.time
        };
        // console.log('event', event);
        events.push(event);
    };

    beforeEach(() => {
        events = [];
    });

    describe('#constructor', () => {
        it('has even stretch lengths', () => {
            const road = new Road(completeRoadAttrs);
            assert.equal(2, road.stretchesLength);
        });
    });

    describe('#computeDistance', () => {

        it('computes the distance traveled across two stretches', () => {
            const road = new Road({
                length: 100,
                stretches: [{
                    velocity: 100,
                }, {
                    velocity: 50,
                }]
            });

            const distance = road.computeDistance(40, 0.5, 100);
            assert.equal(distance, 70);
        });

        it('computes the distance traveled across a stretch with traffic', () => {
            const road = new Road({
                length: 100,
                stretches: [{
                    velocity: 100,
                    lanes: 1,
                    traffic: 51
                }]
            });

            const distance = road.computeDistance(10, 0.5, 100);
            assert.equal(distance, 45);
        });

        it('stops the vehicles at the border when the next stretch is full', () => {
            const road = new Road({
                length: 100,
                stretches: [{
                    velocity: 100,
                    lanes: 1,
                }, {
                    velocity: 100,
                    lanes: 1,
                    traffic: 50
                }]
            });

            const distance = road.computeDistance(40, 0.5, 100);
            assert.equal(distance, 50);
        });

        it('stops the vehicles if the current and next stretch is full', () => {
            const road = new Road({
                length: 100,
                stretches: [{
                    velocity: 100,
                    lanes: 1,
                    traffic: 50
                }, {
                    velocity: 100,
                    lanes: 1,
                    traffic: 50
                }]
            });

            const distance = road.computeDistance(40, 0.5, 100);
            assert.equal(distance, 40);
        });
    });

    describe('simulations', () => {

        it('simulates one vehicle with one stretch', (done) => {
            const road = new Road({
                length: 100,
                sleep: 1,
                fastForward: 1000 * 60 * 3,
                stretches: [{
                    velocity: 100,
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
                assert.equal(events[lastIndex].distance, 100);
                assert.isAtLeast(events[lastIndex].time, 1);
                done();
            });
        });

        it('simulates one vehicle with two stretches', (done) => {
            const road = new Road({
                length: 100,
                sleep: 1,
                fastForward: 1000 * 60 * 3,
                stretches: [{
                    velocity: 100,
                    lanes: 1
                }, {
                    velocity: 50,
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
                assert.equal(events[lastIndex].distance, 100);
                assert.isAtLeast(events[lastIndex].time, 1.5);
                done();
            });
        });
    });
});