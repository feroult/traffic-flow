class Simulator {

    addVehicle(vehicle) {
        new Journey(this, vehicle);
    }

    finish(cb) {
        cb && cb();
    }

}

class Journey {


}

module.exports = Simulator;
