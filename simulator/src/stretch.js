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
        this.traffic += (vehicle.length / 1000);
    }

    exitVehicle(vehicle) {
        this.traffic -= (vehicle.length / 1000);
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

    static build(params) {
        const stretches = [];

        for (let i = 0; i < params.count; i++) {
            stretches.push({
                length: params.length / params.count,
                lanes: params.lanes,
                velocity: params.velocity
            });
        }

        for (let i = 0; i < params.custom.length; i++) {
            const custom = params.custom[i];
            const from = Math.floor(params.count * custom.from);
            const to = Math.ceil(params.count * custom.to);
            for (let j = from; j < to; j++) {
                stretches[j].lanes = custom.lanes;
                stretches[j].velocity = custom.velocity;
            }
        }

        return stretches;
    }

}

module.exports = Stretch;
