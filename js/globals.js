let logged = false;
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

let currentVehicles;

function resetGlobals() {
    concurrentPulls = 0;
    allAckIds = {};
    duplicates = 0;
    vehicles = {};
    elements = [];
    stretches = {};
    currentVehicles = undefined;
}

resetGlobals();