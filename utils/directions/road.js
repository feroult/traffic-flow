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

    computeDistance(from, elapsedHours, targetVelocity) {
        let distance = from;
        let hours = elapsedHours;

        let stretch, index, projectedIndex;

        do {
            index = this.getStretchIndex(distance);

            if (index >= this.stretches.length) {
                break;
            }

            stretch = this.getStretch(distance);

            const velocity = stretch.computeVelocity(targetVelocity);
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

        return distance;
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


}

module.exports = Road;