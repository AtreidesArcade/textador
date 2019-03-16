// Initialize Firebase
var config = {
    apiKey: "AIzaSyCLom2bRLE1W1FDkWTboLGewtNWYwmQi4w",
    authDomain: "project2twiliocms.firebaseapp.com",
    databaseURL: "https://project2twiliocms.firebaseio.com",
    projectId: "project2twiliocms",
    storageBucket: "project2twiliocms.appspot.com",
    messagingSenderId: "1061587626523"
};

firebase.initializeApp(config);

let token = false; /* Set this when authorized */
function refreshToken() {
    return new Promise((resolve, reject) => {
        firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
            return resolve(idToken);
        }).catch((err) => {
            return reject(err);
        });
    });
}

// Mke sure secure token gets sent with evry ajax request
// Somehow we need to refresh the token if expired
$.ajaxSetup({
    beforeSend: function (xhr) {
        /* check if token is set or retrieve it */
        if (token) {
            // Refresh the token, but you cant wait to set header since it wont get stuck on this request
            // if I put the setRequestHeader inside .then, the ajaxSetup returns before async finishes
            // So I guess this just refreshes it for the next time,  wish there was a better way to tell if its expired
            refreshToken().then( idToken => {
                token = idToken;
            });
            xhr.setRequestHeader('FIREBASE_AUTH_TOKEN', token);
        }
    }
});

// Keep user in Memory for quick access
let _currentAuthUser;

function currentAuthUser() {
    return _currentAuthUser;
}

// this should be available on every page. 
function authLogOff() {
    firebase.auth().signOut().then(function () {
        console.log('success logout');
        window.location.replace("/login");
    }, function () {});
}

// create a table entry for the user to store its uid
function updateAuthUserDB() {
    $.ajax({
        type: 'POST',
        url: "/api/createBaseUser",
        datatype: "application/json",
        success: (response) => {
            console.log("authcommon",response.uid);
        },
        error: (err) => {
            console.error(err);
        }
    });
}

function authCheck(redirectURL, aCallback) {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // Save the user info in memory for quick access by client apps
            _currentAuthUser = user;

            user.getIdToken(true).then(function (idToken) {
                // Send token to your backend via HTTPS
                token = idToken;
                // console.log(`token: ${token}`);
                $(".loggedIn").removeClass('hide');
                $(".notLoggedIn").addClass('hide');

                // put entry into user database if it does not exist
                updateAuthUserDB();
                aCallback(user);
            }).catch((error) => {
                token = false;
                console.error(`error creating id token`);
                $(".loggedIn").removeClass('hide');
                $(".notLoggedIn").addClass('hide');
                aCallback(user);
            });
        } else {
            token = false;
            _currentAuthUser = null;

            $(".loggedIn").addClass('hide');
            $(".notLoggedIn").removeClass('hide');
            window.location.replace("/login");
            aCallback(null);
        }
    });
}

function authLogin() {
    // See how to pass this url or route later
    let redirectURL = "index.html";

    // Firebase pre-built UI
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.

                window.location.replace(redirectURL);
                return true;
            },
            uiShown: function () {
                // Hide Spinning wait message
                $("#loader").addClass('hide');
                // Show all items that should only appear if logged off
                // Hide all items that should only appear if logged in
                $(".loggedIn").addClass('hide');
                $(".notLoggedIn").removeClass('hide');
            }
        },
        // Use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'redirect',
        signInSuccessUrl: redirectURL,
        signInOptions: [
            // Make sure these are all autorized on firebase signin options on dashboard
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '#',
        // Privacy policy url.
        privacyPolicyUrl: '#'
    };

    // Unhide the loading spinner message.
    $("#loader").removeClass('hide');
    // The start method will wait until the DOM is loaded.
    ui.start("#firebaseui-auth-container", uiConfig);
}