const assert = require('assert');

const Strech = require('../strech');

describe('Stretch', () => {

    let stretch;

    beforeEach(() => {
        stretch = new Strech({
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

    it('computes the current velocitoy', () => {
        assert.equal(100, stretch.computeVelocity(100));
    });

});