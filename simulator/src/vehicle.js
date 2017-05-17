class Vehicle {

    constructor(attrs) {
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
        this.distance = this.road.computeDistance(this.distance, elapsedHours, this.targetVelocity);

        // move from streches

        this.emitter(this);

        if (this.distance >= this.road.length) {
            this.road.removeVehicle(this);
        } else {
            this.scheduleNextMove();
        }
    }

}

module.exports = Vehicle;