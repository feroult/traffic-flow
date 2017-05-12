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

}

module
    .exports = Strech;
