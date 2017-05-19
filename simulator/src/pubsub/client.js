const PubSub = require('@google-cloud/pubsub');

const config = require('../config/config');

const pubsubClient = PubSub({
    projectId: config.projectId,
    keyFilename: 'keyfile.json'
});

module.exports = pubsubClient;
