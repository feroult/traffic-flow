const assert = require('assert');

const Stretch = require('../stretch');

describe('Stretch', () => {

    describe('#trafficLoad', () => {
        let stretch;

        beforeEach(() => {
            stretch = new Stretch({
                lanes: 2,
                length: 9
            });
        });

        it('has no traffic load', () => {
            assert.equal(0, stretch.trafficLoad());
        });

        it('enters a vehicle and gets more traffic', () => {
            stretch.enterVehicle({length: 3});
            assert.equal(3 / (2 * 9), stretch.trafficLoad());
        });

        it('exits a vehicle and gets less traffic', () => {
            stretch.enterVehicle({length: 3});
            stretch.enterVehicle({length: 3});
            stretch.exitVehicle({length: 3});
            assert.equal(3 / (2 * 9), stretch.trafficLoad());
        });

        it('can be full', () => {
            stretch.enterVehicle({length: 18});
            assert.ok(stretch.isFull());
        });

    });

    describe('#computeVelocity', () => {
        it('whithout a road limit', () => {
            const stretch = new Stretch();
            assert.equal(100, stretch.computeVelocity(100));
        });

        it('with a road limit', () => {
            const stretch = new Stretch({
                velocity: 50
            });
            assert.equal(50, stretch.computeVelocity(100));
        });
    });

});