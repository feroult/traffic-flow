class Vehicle {
    
    constructor(attrs) {
        Object.assign(this, attrs);
    }

    enter(road) {
        this.road = road;
        this.stretchIndex = 0;
        this.scheduleNextMove();
    }

    scheduleNextMove() {
        this.velocity = this.computeVelocity();
        this.timestamp = new Date().getTime();
        setTimeout(() => this.move(), this.road.sleep);
    }

    move() {
        // const elapsed = new Date().getTime() - this.timestamp;
        this.emitter(this, {});
        this.stretchIndex++;
        if (this.stretchIndex > 0) {
            this.road.removeVehicle(this);
        } else {
            this.scheduleNextMove();
        }
    };

    computeVelocity() {
        const stretch = this.road.getStretch(this.stretchIndex);
        return stretch.computeVelocity(this.targetVelocity);
    }

}

module.exports = Vehicle;