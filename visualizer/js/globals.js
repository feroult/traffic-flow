let authPromise;
let map;
let pubsub;

let keepPulling = false;
let concurrentPulls;
let lastPullSuccess;
let allAckIds;
let duplicates;

let vehicles;
let elements;

function resetGlobals() {
    concurrentPulls = 0;
    allAckIds = {};
    duplicates = 0;
    vehicles = {};
    elements = [];
}

resetGlobals();