const pubsub = require('./client');

const LOG_COUNT_BATCH = 500;
let start = new Date().getTime();
let count = 0;

function publish(argv, data) {

    const topicName = argv.topic;
    const isVerbose = () => argv.verbose && argv.verbose !== 'false';

    const topic = pubsub.topic(topicName);

    const message = {
        data: data,
        attributes: {
            timestamp: data.timestamp
        }
    };

    const options = {
        raw: true
    };

    return topic
        .publisher()
        .publish(Buffer.from(JSON.stringify(data)))
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
        const elapsed = Math.floor((new Date().getTime() - start) / 1000);
        console.log(`${count} events, ${elapsed}/s.`);
    }
}

module.exports = publish;