function startPulling() {
    keepPulling = true;
    setTimeout(executePull, 0);

    concurrentPulls = 1;
    duplicates = 0;
}

function executePull() {
    if (!keepPulling) {
        return;
    }

    fanout();
    execute();
}

function fanout() {
    const now = Date.now();

    // relaunch additional concurrent requests if they seem to have been successful in the past and within the MAXCONCURRENT limit
    for (let i = 0; concurrentpulls < PUBSUB_MAXCONCURRENT && now - lastpullsuccess < PUBSUB_RETRY_PERIOD; i++) {
        setTimeout(executePull, 100 * i);
        concurrentPulls++;
    }
}

function execute() {
    const request = pubsub.projects.subscriptions.pull({
        subscription: PUBSUB_SUBSCRIPTION,
        max_messages: PUBSUB_MAXMESSAGES
    });

    request.execute(function (response) {
        if (concurrentPulls > 0) {
            concurrentPulls--;
        }

        lastpullsuccess = Date.now();

        if (hasMessages(response)) {
            const messages = parseMessages(response);
            const ackIds = parseAckIds(response);

            ackReceivedMessages(ackIds)
        }
    });
}

function hasMessages(resp) {
    return 'receivedMessages' in resp && resp.receivedMessages.length > 0;
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
    console.log("Received " + ackIds.length + " PubSub messages. Duplicates so far: " + duplicates);

    executeAckRequest(ackIds);
}

function executeAckRequest(ackIds) {
    const request = pubsub.projects.subscriptions.acknowledge({
        subscription: PUBSUB_SUBSCRIPTION,
        ackIds: ackIds
    });

    request.execute(function () {
        if (concurrentPulls < PUBSUB_MAXCONCURRENT) {
            setTimeout(executePull, 100);
            concurrentPulls++
        }
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
