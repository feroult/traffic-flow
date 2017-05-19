const shortid = require('shortid');

const Stretch = require('./stretch');

const interpolate = require('./directions/get-directions').interpolate;

class Road {

    constructor(attrs) {
        Object.assign(this, attrs);
        this.simulationId = shortid.generate();
        this.vehiclesCount = 0;
        this.vehicles = {};
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

    moveVehicleTo(vehicle, elapsedHours) {
        vehicle.distance = this._computeVehicleNewDistance(vehicle, elapsedHours);
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

            if (stretch.isFull()) {
                if (this.getStretchIndex(vehicle.distance) !== index ||
                    this._nextStretchIsFull(index)) {
                    break;
                }
            }

            velocity = stretch.computeVelocity(targetVelocity);
            const delta = velocity * hours;

            projectedIndex = this.getStretchIndex(distance + delta);

            if (projectedIndex === index) {
                distance += delta;
            } else {
                const partialDelta = ((index + 1) * this.stretchesLength) - distance;
                const partialHours = partialDelta / velocity;
                hours -= partialHours;
                distance += partialDelta;
            }

        } while (index !== projectedIndex);

        this._updateStretchesTraffic(vehicle, projectedIndex);
        vehicle.velocity = velocity;

        return distance;
    }

    _updateStretchesTraffic(vehicle, projectedIndex) {
        if (vehicle.stretchIndex && vehicle.stretchIndex !== projectedIndex) {
            this.stretches[vehicle.stretchIndex].exitVehicle(vehicle);
            vehicle.stretchIndex = undefined;
        }

        if (projectedIndex !== undefined && projectedIndex < this.stretches.length &&
            projectedIndex !== vehicle.stretchIndex) {
            this.stretches[projectedIndex].enterVehicle(vehicle);
            vehicle.stretchIndex = projectedIndex;
        }
    }

    addVehicle(vehicle) {
        this.vehiclesCount++;
        this.vehicles[vehicle.id] = vehicle;
        vehicle.enter(this);
    }

    removeVehicle(vehicle) {
        this.vehiclesCount--;
        delete this.vehicles[vehicle.id];
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
        this.stretches = this.stretchesBackup.map(s => Object.assign({}, s));
    }

    finish(cb) {
        this.finishCb = cb;
    }

    _nextStretchIsFull(index) {
        return (index + 1 < this.stretches.length && this.stretches[index + 1].isFull());
    }

    getPoint(distance) {
        return interpolate(this, distance / 100);
    }

    static loadConfig(file) {
        const config = require(file);
        config.stretches = Stretch.build(config.stretches);
        return config;
    }

}

module.exports = Road;