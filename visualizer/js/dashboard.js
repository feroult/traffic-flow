$(document).ready(function () {
    $('#sign-in').click(signIn);
    $('#sign-out').click(signOut);
    $('#start').click(start);
    $('#stop').click(stop);
});

function start() {
    disableAllButtons();
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
            configureButtons();
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


function stop(cb) {
    if (!keepPulling) {
        cb && cb();
        return;
    }

    disableAllButtons();
    console.log('stopping...');

    pubsub.projects.subscriptions
        .delete({subscription: PUBSUB_SUBSCRIPTION})
        .then(function () {
            keepPulling = false;
            resetGlobals();
            configureButtons();
            isFunction(cb) && cb();
        });
}

function configureButtons() {
    document.getElementById('sign-in').disabled = logged;
    document.getElementById('sign-out').disabled = !logged;
    document.getElementById('start').disabled = !logged || keepPulling;
    document.getElementById('stop').disabled = !logged || !keepPulling;
}

function disableAllButtons() {
    document.getElementById('sign-in').disabled = true;
    document.getElementById('sign-out').disabled = true;
    document.getElementById('start').disabled = true;
    document.getElementById('stop').disabled = true;
}

function isFunction(functionToCheck) {
    const getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}