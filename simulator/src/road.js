const shortid = require('shortid');

const Stretch = require('./stretch');

const interpolate = require('./directions/get-directions').interpolate;

class Road {

    constructor(attrs) {
        Object.assign(this, attrs);
        this.simulationId = shortid.generate();
        this.vehiclesCount = 0;
        this.vehicles = {};
        this.vehiclesInOrder = [];
        this.exited = false;
        this.stretchesLength = attrs.length / attrs.stretches.length;
        this.stretches = attrs.stretches.map(strech => {
            strech.length = this.stretchesLength;
            return new Stretch(strech);
        });
        this.stretchesBackup = this.stretches.map(s => Object.assign({}, s));
    }

    getStretch(distance) {
        return this.stretches[this.getStretchIndex(distance)];
    }

    getStretchIndex(distance) {
        return Math.floor(distance / this.stretchesLength);
    }

    moveVehicles() {
        for (let i = 0, l = this.vehiclesInOrder.length; i < l; i++) {
            const vehicle = this.vehiclesInOrder[i];
            vehicle.move();
        }
        if (this.exited) {
            this.vehiclesInOrder = this.vehiclesInOrder.filter(function (v) {
                return !v.exited;
            })
            this.exited = false;
        }
    }

    moveVehicleTo(vehicle, elapsedHours) {
        vehicle.distance = this._computeVehicleNewDistance(vehicle, elapsedHours);
        // console.log('moveTo', `stretch=${vehicle.stretchIndex}`, `velocity=${vehicle.velocity}`, `id=${vehicle.id}`);
    }

    _computeVehicleNewDistance(vehicle, elapsedHours) {
        const targetVelocity = vehicle.targetVelocity;

        let distance = vehicle.distance;
        let hours = elapsedHours;

        let stretch, index, projectedIndex, velocity;

        do {
            index = this.getStretchIndex(distance);

            if (index >= this.stretches.length) {
                break;
            }

            stretch = this.getStretch(distance);

            if (stretch.isFull() && vehicle.stretchIndex !== index) {
                break;
            }

            velocity = stretch.computeVelocity(targetVelocity, `index=${index}`);

            const delta = velocity * hours;

            projectedIndex = this.getStretchIndex(distance + delta);

            if (projectedIndex === index) {
                distance += delta;
            } else {
                const newDistance = ((index + 1) * this.stretchesLength);

                if (this._nextStretchIsFull(index)) {
                    distance = newDistance - 0.001;
                    break;
                }

                const partialDelta = newDistance - distance;
                const partialHours = partialDelta / velocity;

                hours -= partialHours;
                distance = newDistance + 0.00001;
            }

        } while (index !== projectedIndex);


        if (vehicle.distance !== distance) {
            this._updateStretchIndex(vehicle, index);
        }
        vehicle.velocity = velocity;


        return distance;
    }

    _updateStretchIndex(vehicle, newIndex) {
        if (vehicle.stretchIndex !== undefined && vehicle.stretchIndex !== newIndex) {
            this.stretches[vehicle.stretchIndex].exitVehicle(vehicle);
            vehicle.stretchIndex = undefined;
        }

        if (newIndex !== undefined && newIndex < this.stretches.length &&
            newIndex !== vehicle.stretchIndex) {
            var stretch = this.stretches[newIndex];

            if (!stretch) {
                console.log('ops', newIndex, this.stretches.length, this.stretches);
            }

            stretch.enterVehicle(vehicle);

            // if (stretch.trafficLoad() > 0.20) {
            //     console.log('COUNT', `index=${newIndex}`, `count=${stretch.vehicleCount}`, `load=${stretch.trafficLoad()}`, `full=${stretch.isFull()}`);
            // }

            vehicle.stretchIndex = newIndex;
        }
    }

    addVehicle(vehicle) {
        this.vehiclesCount++;
        this.vehicles[vehicle.id] = vehicle;
        this.vehiclesInOrder.push(vehicle);
        vehicle.enter(this);
    }

    removeVehicle(vehicle) {
        this.vehiclesCount--;
        delete this.vehicles[vehicle.id];
        vehicle.exited = true;
        this.exited = true;
        if (this.vehiclesCount == 0) {
            this.finishCb && this.finishCb();
        }
    }

    resetSleepTimeout() {
        for (let id in this.vehicles) {
            if (this.vehicles.hasOwnProperty(id)) {
                this.vehicles[id].resetSleepTimeout();
            }
        }
    }

    change(params) {
        const count = this.stretches.length;

        const from = Math.floor(count * params.from);
        const to = Math.ceil(count * params.to);
        for (let j = from; j < to; j++) {
            params.lanes && (this.stretches[j].lanes = params.lanes);
            params.velocity && (this.stretches[j].velocity = params.velocity);
        }
    }

    reset() {
        for (let i = 0; i < this.stretches.length; i++) {
            this.stretches[i].lanes = this.stretchesBackup[i].lanes;
            this.stretches[i].velocity = this.stretchesBackup[i].velocity;
        }

    }

    finish(cb) {
        this.finishCb = cb;
    }

    _nextStretchIsFull(index) {
        return (index + 1 < this.stretches.length && this.stretches[index + 1].isFull());
    }

    getPoint(distance, segmentIndex) {
        return interpolate(this, distance / 100);
    }

    static loadConfig(file) {
        const config = require(file);
        config.stretches = Stretch.build(config.stretches);
        return config;
    }

}

module.exports = Road;