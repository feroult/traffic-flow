let authPromise;
let map;
let directions;
let pubsub;

let keepPulling = false;
let concurrentPulls;
let lastPullSuccess;
let allAckIds;
let duplicates;
let showVehicles = false;

let vehicles;
let elements;
let stretches;

function resetGlobals() {
    concurrentPulls = 0;
    allAckIds = {};
    duplicates = 0;
    vehicles = {};
    elements = [];
    stretches = {};
}

resetGlobals();