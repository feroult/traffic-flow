const Strech = require('./strech');

class Road {

    constructor(attrs) {
        Object.assign(this, attrs);
        this.vehicles = 0;
        this.stretchesLength = attrs.length / attrs.stretches.length;
        this.stretches = attrs.stretches.map(strech => {
            strech.length = this.stretchesLength;
            return new Strech(strech);
        });
    }

    getStretch(index) {
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