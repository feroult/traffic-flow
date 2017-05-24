let auth2; // The Sign-In object.

// Google Maps API initialisation
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 40.75144, lng: -74.00331},
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });
}

// Google Auth2, PubSub, CRM API initialisation
function handleClientLoad() {
    authPromise =
        loadAuth2()
            .then(initAuth2)
            .then(checkSignIn)
            .then(loadPubSub)
            .then(initPubSub, logError);
}

function loadAuth2() {
    return new Promise(function (resolve, reject) {
        gapi.load('client:auth2', resolve)
    })
}

function initAuth2() {
    return gapi.auth2.init({
        client_id: '832425333292-dppbb60t194ic98obkrohfaa0rulcpts.apps.googleusercontent.com',
        scope: 'profile https://www.googleapis.com/auth/pubsub'
    }).then(); // The API does not return a Promise but an object that returns a Promise from its .then() function
}

function checkSignIn() {
    auth2 = gapi.auth2.getAuthInstance();
    // Listen for sign-in state changes.
    auth2.isSignedIn.listen(updateSigninStatus);
    // Handle the initial sign-in state.
    updateSigninStatus(auth2.isSignedIn.get());
}

function loadPubSub() {
    return gapi.client.load('pubsub', 'v1')
}

function initPubSub() {
    pubsub = gapi.client.pubsub
}

function logError(err) {
    console.log(err)
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        console.log('logged');
    } else {
        console.log('not logged');
    }
}

function signIn() {
    auth2.signIn();
}

function signOut() {
    auth2.signOut();
}