const Stretch = require('./stretch');

class Road {

    constructor(attrs) {
        Object.assign(this, attrs);
        this.vehicles = 0;
        this.stretchesLength = attrs.length / attrs.stretches.length;
        this.stretches = attrs.stretches.map(strech => {
            strech.length = this.stretchesLength;
            return new Stretch(strech);
        });
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
        this.vehicles++;
        vehicle.enter(this);
    }

    removeVehicle(vehicle) {
        this.vehicles--;
        if (this.vehicles == 0) {
            this.finishCb && this.finishCb();
        }
    }

    finish(cb) {
        this.finishCb = cb;
    }

    _nextStretchIsFull(index) {
        return (index + 1 < this.stretches.length && this.stretches[index + 1].isFull());
    }


}

module.exports = Road;