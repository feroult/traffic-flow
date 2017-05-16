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
        this.velocity = this.computeVelocity();
        this.timestamp = new Date().getTime();
        setTimeout(() => this.move(), this.road.sleep);
    }

    move() {
        const elapsedHours = ((new Date().getTime() - this.timestamp)) * this.road.fastForward / 1000 / 60 / 60;

        this.time += elapsedHours;
        this.distance += this.velocity * elapsedHours;

        this.emitter(this);

        if (this.distance >= this.road.length) {
            this.road.removeVehicle(this);
        } else {
            this.scheduleNextMove();
        }
    };

    computeVelocity() {
        const stretch = this.road.getStretch(this.distance);
        return stretch.computeVelocity(this.targetVelocity);
    }

}

module.exports = Vehicle;