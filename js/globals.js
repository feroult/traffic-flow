let authPromise;
let map;
let pubsub;

let keepPulling = false;
let concurrentPulls = 0;
let lastpullsuccess;
let allAckIds = {};
let duplicates = 0;