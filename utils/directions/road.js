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
        const index = Math.floor(distance / this.stretchesLength);
        return this.stretches[index];
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