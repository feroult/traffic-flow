const pubsub = require('./client');

const LOG_COUNT_BATCH = 100;
let count = 0;

function publish(argv, data) {

    const topicName = argv.topic;
    const isVerbose = () => argv.verbose && argv.verbose !== 'false';

    const topic = pubsub.topic(topicName);

    return topic.publish(data)
        .then((results) => {
            log();
            const messageIds = results[0];
            if (isVerbose()) {
                // console.log(`Message ${messageIds[0]} published.`);
            }
            return messageIds;
        });

}

function log() {
    count++;
    if (count % LOG_COUNT_BATCH === 0) {
        count = 0;
        console.log(`${LOG_COUNT_BATCH} events.`);
    }
}

module.exports = publish;