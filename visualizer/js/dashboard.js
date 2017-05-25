$(document).ready(function () {
    $('#sign-in').click(signIn);
    $('#sign-out').click(signOut);
    $('#start').click(start);
    $('#stop').click(stop);
});

function start() {
    console.log('starting...');

    pubsub.projects.subscriptions
        .delete({subscription: PUBSUB_SUBSCRIPTION})
        .then(
            createTopic, createTopic
        ).then(
        function () {
            if (auth2.isSignedIn.get()) {
                startPulling();
            }
        }
    );
}

function createTopic() {
    return pubsub.projects.subscriptions
        .create({
            name: PUBSUB_SUBSCRIPTION,
            topic: TOPIC_ID,
            ackDeadlineSeconds: 120
        });
};


function stop() {
    console.log('stopping...');
}