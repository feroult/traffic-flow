let authPromise;
let map;
let pubsub;

let keepPulling = false;
let concurrentPulls = 0;
let lastPullSuccess;
let allAckIds = {};
let duplicates = 0;

// markers
let vehicles = {};