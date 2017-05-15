class Simulator {

    constructor(road) {
        this.road = road;
        this.count = 0;
        this.defaultSleepMs = 1;
    }

    addVehicle(vehicle) {
        this.count++;
        console.log('ve', vehicle)
        vehicle.enter(this);
    }

    finish(cb) {
        cb && cb();
    }

}


module.exports = Simulator;
