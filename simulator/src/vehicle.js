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
        this.stretchIndex = undefined;
        this.scheduleNextMove();
    }

    scheduleNextMove() {
        this.timestamp = new Date().getTime();
        // this.timeoutId = setTimeout(() => this.move(), this._sleepInterval());
    }

    resetSleepTimeout() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => this.move(), this._sleepInterval());
        }
    }

    _sleepInterval() {
        let sleep = this.road.sleep;
        const realSleep = (typeof sleep == 'function') ? sleep() : sleep;
        return realSleep / this._fastForward();
    }

    _fastForward() {
        let ff = this.road.fastForward;
        return (typeof ff == 'function') ? ff() : ff;
    }

    move() {
        process.stdout.write('.');

        const elapsedHours = ((new Date().getTime() - this.timestamp)) * this._fastForward() / 1000 / 60 / 60;

        this.time += elapsedHours;
        this.road.moveVehicleTo(this, elapsedHours);

        this.emitter && this.emitter(this);

        if (this.distance + 0.00001 >= this.road.length) {
            process.stdout.write('x');
            this.road.removeVehicle(this);
        } else {
            this.scheduleNextMove();
        }
    }

}

module.exports = Vehicle;