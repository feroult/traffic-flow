class Vehicle {

    constructor(attrs) {
        Object.assign(this, attrs);
    }

    enter(road) {
        this.road = road;
        this.strechIndex = 0;
        this.timestamp = new Date().getTime();
        this.velocity = this.computeVelocity();

        setTimeout(this.move, this.road.sleep);
    }

    move() {
        const elapsed = new Date().getTime() - this.timestamp;
        setTimeout(this.move, this.road.sleep);
    }

    computeVelocity() {
        const stretch = this.road.getStretch(this.strechIndex);
    }

}

module.exports = Vehicle;