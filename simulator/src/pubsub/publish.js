const pubsub = require('./client');

function publish(argv, data) {

    const topicName = argv.topic;
    const isVerbose = () => argv.verbose && argv.verbose !== 'false';

    const topic = pubsub.topic(topicName);

    return topic.publish(data)
        .then((results) => {
            const messageIds = results[0];
            if (isVerbose()) {
                console.log(`Message ${messageIds[0]} published.`);
            }
            return messageIds;
        });

}

module.exports = publish;