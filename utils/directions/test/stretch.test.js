const assert = require('assert');

const Strech = require('../strech');

describe('Strech', () => {

    let strech;

    beforeEach(() => {
        strech = new Strech({
            lanes: 2,
            length: 9
        });
    });

    it('has no traffic load', () => {
        assert.equal(0, strech.trafficLoad());
    });

    it('enters a vehicle and gets more traffic', () => {
        strech.addVehicle({length: 3});
        assert.equal(3 / (2 * 9), strech.trafficLoad());
    });

    it('exits a vehicle and gets less traffic', () => {
        strech.addVehicle({length: 3});
        strech.addVehicle({length: 3});
        strech.exitVehicle({length: 3});
        assert.equal(3 / (2 * 9), strech.trafficLoad());
    });

    it('can be full', () => {
        strech.addVehicle({length: 18});
        assert.ok(strech.isFull());
    });

});