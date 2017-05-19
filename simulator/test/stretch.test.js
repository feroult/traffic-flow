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


    describe('#builder', () => {
        const params = {
            count: 100,
            length: 71.32534361053114,
            lanes: 5,
            velocity: 120,
            custom: [
                {
                    from: 0.112,
                    to: 0.125,
                    lanes: 6,
                    velocity: 30
                },
                {
                    from: 0.655,
                    to: 0.664,
                    lanes: 6,
                    velocity: 30
                },
                {
                    from: 0.935,
                    to: 1,
                    lanes: 2,
                    velocity: 90
                }
            ]
        };

        it('build a stretches array from params object', () => {
            const stretches = Stretch.build(params);
            assert.equal(100, stretches.length);

            const firstStretch = stretches[0];
            assert.equal(5, firstStretch.lanes);
            assert.equal(120, firstStretch.velocity);

            for (let i = 11; i < 12; i++) {
                const toll1 = stretches[i];
                assert.equal(6, toll1.lanes);
                assert.equal(30, toll1.velocity);
            }

            for (let i = 65; i < 67; i++) {
                const toll2 = stretches[i];
                assert.equal(6, toll2.lanes);
                assert.equal(30, toll2.velocity);
            }

            for (let i = 93; i < 100; i++) {
                const city = stretches[i];
                assert.equal(2, city.lanes);
                assert.equal(90, city.velocity);
            }
        });
    });

});