const TRAFFIC_SLOWDOWN_THRESHOLD = 0.3;
const MINIMUN_VELOCITY_THRESHOLD = 5;

class Stretch {

    constructor(attrs) {
        this.traffic = 0;
        this.maxTraffic = attrs.lanes * attrs.length;

        Object.assign(this, attrs);
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

    computeVelocity(targetVelocity) {
        let velocity = (this.velocity < targetVelocity) ? this.velocity : targetVelocity;

        if (this.trafficLoad() > TRAFFIC_SLOWDOWN_THRESHOLD) {
            const slowDownFactor = (this.trafficLoad() - TRAFFIC_SLOWDOWN_THRESHOLD ) / ( 1 - TRAFFIC_SLOWDOWN_THRESHOLD);
            velocity = velocity * (1 - slowDownFactor);
            return velocity > MINIMUN_VELOCITY_THRESHOLD ? velocity : MINIMUN_VELOCITY_THRESHOLD;
        }

        return velocity;
    }

}

module.exports = Stretch;
