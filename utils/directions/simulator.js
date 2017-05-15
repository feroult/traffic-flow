class Simulator {

    addVehicle(vehicle) {

        new Journey(this, vehicle);

    }

    finish() {
        return Promise.resolve(true);
    }

}

module.exports = Simulator;
