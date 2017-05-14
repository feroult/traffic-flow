class Strech {

    constructor(attrs) {
        this.maxTraffic = attrs.lanes * attrs.length;
        this.traffic = 0;
    }

    trafficLoad() {
        return this.traffic / this.maxTraffic;
    }

    enterVehicle(vehicle) {
        this.traffic += vehicle.length;
    }

    exitVehicle(vehicle) {
        this.traffic -= vehicle.length;
    }

    isFull() {
        return this.traffic >= this.maxTraffic;
    }

}

module.exports = Strech;
