const assert = require('assert');

const Stretch = require('../src/stretch');

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
            assert.equal(stretch.trafficLoad(), 0);
        });

        it('enters a vehicle and gets more traffic', () => {
            stretch.enterVehicle({length: 3});
            assert.equal(stretch.trafficLoad(), 0.003 / (2 * 9));
        });

        it('exits a vehicle and gets less traffic', () => {
            stretch.enterVehicle({length: 3});
            stretch.enterVehicle({length: 3});
            stretch.exitVehicle({length: 3});
            assert.equal(stretch.trafficLoad(), 0.003 / (2 * 9));
        });

        it('can be full', () => {
            stretch.enterVehicle({length: 18000});
            assert.ok(stretch.isFull());
        });

    });

    describe('#computeVelocity', () => {
        it('whithout a road limit', () => {
            const stretch = new Stretch({lanes: 1, length: 1});
            assert.equal(100, stretch.computeVelocity(100));
        });

        it('with a road limit', () => {
            const stretch = new Stretch({
                velocity: 50
            });
            assert.equal(stretch.computeVelocity(100), 50);
        });

        it('with traffic', () => {
            const stretch = new Stretch({
                velocity: 100,
                lanes: 1,
                length: 10,
                traffic: 5.1
            });
            assert.equal(stretch.computeVelocity(100), 70);
        });

        it('has a mininum velocity', () => {
            const stretch = new Stretch({
                velocity: 100,
                lanes: 1,
                length: 10,
                traffic: 10
            });
            assert.equal(stretch.computeVelocity(100), 5);
        });
    });

});