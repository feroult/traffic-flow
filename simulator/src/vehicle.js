const shortid = require('shortid');

class Vehicle {

    constructor(attrs) {
        attrs.id = shortid.generate();
        Object.assign(this, attrs);
    }

    enter(road) {
        this.road = road;
        this.time = 0;
        this.distance = 0;

        this.scheduleNextMove();
    }

    scheduleNextMove() {
        this.timestamp = new Date().getTime();
        setTimeout(() => this.move(), this.road.sleep);
    }

    move() {
        const elapsedHours = ((new Date().getTime() - this.timestamp)) * this.road.fastForward / 1000 / 60 / 60;

        this.time += elapsedHours;
        this.road.moveVehicleTo(this, elapsedHours);

        this.emitter && this.emitter(this);

        if (this.distance >= this.road.length) {
            this.road.removeVehicle(this);
        } else {
            this.scheduleNextMove();
        }
    }

}

module.exports = Vehicle;