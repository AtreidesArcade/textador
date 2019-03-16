"use strict";
require("dotenv");
const path = require("path");

// Need to use firebase admin to get at firebase stuff in node
// This will also be used to get a firestore cloud storage on the server
// This gives us access to the *client side APIs* in firebase on node.
const admin = require("firebase-admin");
const storageBucket = "project2twiliocms.appspot.com";
const databaseURL = "https://project2twiliocms.firebaseio.com";

// if  GOOGLE_APPLICATION_CREDENTIALS set, use this file, else, dont send cred since App Engine finds it
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const serviceAccount = require(path.join(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL,
        storageBucket: storageBucket
    });
} else {
    admin.initializeApp({
        databaseURL: databaseURL,
        storageBucket: storageBucket
    });
}

module.exports = admin;