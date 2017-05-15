class Vehicle {

    constructor(attrs) {
        Object.assign(this, attrs);
    }

    enter(sim) {
        this.sim = sim;
        this.strechIndex = 0;
        this.timestamp = new Time().getTime();
        this.velocity = this.computeVelocity();

        setTimeout(this.move, sim.defaultSleepMs);
    }

    move() {
        const elapsed = new Time().getTime() - this.timestamp;

        setTimeout(this.move, sim.defaultSleepMs);
    }

    computeVelocity() {
        const streech = this.sim.road.getStreech(this.strechIndex);
    }

}

module.exports = Vehicle;