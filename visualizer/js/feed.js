function startPulling() {
    keepPulling = true;
    setTimeout(pullJob, 0);

    resetGlobals();
    lastPullSuccess = new Date();
}

function pullJob() {
    if (!keepPulling) {
        return;
    }

    fanout();
    executePull();
}

function fanout() {
    const now = Date.now();

    // relaunch additional concurrent requests if they seem to have been successful in the past and within the MAXCONCURRENT limit
    //  && now - lastPullSuccess < PUBSUB_RETRY_PERIOD

    for (let i = 0; concurrentPulls < PUBSUB_MAXCONCURRENT; i++) {
        setTimeout(pullJob, 100 * i);
        concurrentPulls++;
    }
}

function nextPull() {
    if (concurrentPulls < PUBSUB_MAXCONCURRENT) {
        setTimeout(pullJob, 100);
        concurrentPulls++
    }
}

function executePull() {
    const request = pubsub.projects.subscriptions.pull({
        subscription: PUBSUB_SUBSCRIPTION,
        max_messages: PUBSUB_MAXMESSAGES
    });

    request.execute(function (response) {
        if (concurrentPulls > 0) {
            concurrentPulls--;
        }

        lastPullSuccess = Date.now();

        if (hasMessages(response)) {
            const messages = parseMessages(response);
            const ackIds = parseAckIds(response);
            // addVehicleMarkers(messages);
            printCounts(filter(messages, "ROAD_24_HOURS"), "day");
            printCounts(filter(messages, "ROAD_5_MINUTES"), "instant");
            ackReceivedMessages(ackIds)
        } else {
            nextPull();
        }
    });
}

function hasMessages(resp) {
    return 'receivedMessages' in resp && resp.receivedMessages.length > 0;
}

function filter(messages, type) {
    return messages.filter(m => m.type === type);
}

function parseMessages(resp) {
    return resp.receivedMessages.map(function (msg) {
        return JSON.parse(window.atob(msg.message.data))
    });
}

function parseAckIds(resp) {
    return resp.receivedMessages.map(function (msg) {
        return msg.ackId
    });
}

function ackReceivedMessages(ackIds) {
    if (ackIds.length <= 0) {
        return;
    }

    countDuplicates(ackIds);
    // console.log("Received " + ackIds.length + " PubSub messages. Duplicates so far: " + duplicates);

    executeAckRequest(ackIds);
}

function executeAckRequest(ackIds) {
    const request = pubsub.projects.subscriptions.acknowledge({
        subscription: PUBSUB_SUBSCRIPTION,
        ackIds: ackIds
    });

    request.execute(function () {
        nextPull();
    })
}

function countDuplicates(ackIds) {
    const now = Date.now();
    ackIds.forEach(function (id) {
        if (id in allAckIds) {
            duplicates++;
        } else {
            allAckIds[id] = now;
        }
    });
}

var printCounts = function (messages, label) {
    for (let i = 0; i < messages.length; i++) {
        console.log('label=', label, 'count=', messages[i].count);
    }

};
