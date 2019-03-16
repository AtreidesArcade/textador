"use strict";

const requiresLogin = require('../config/middleware/requiresLogin.js');

const Photo = require("../logic/photos");
const photos = new Photo();

module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });

    // Route for getting all photos from photos table for the currently authenticated user
    app.get("/api/photo", requiresLogin, (req, res) => {
        try {
            photos.getAllForUser(req.user.uid)
                .then(photosData => {
                    res.json(photosData);
                }).catch(err => {
                    console.error(`error selecting with where ${err}`);
                    // TODO: Find proper way to throw error to the client
                    res.status(500).json(err.errors[0].message);
                });
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.post("/api/photo
             ..." ${err.errors[0].message}`);
        }
    }); // Route

    // Route create photos for the currently authenticated user
    // the Photo has already been saved in firebase/google cloud storage on the client from a file upload
    app.post("/api/photo", requiresLogin, (req, res) => {
        try {
            photos.createUserPhoto(req.user.uid, req.body)
                .then(photo => {
                    res.json(photo);
                }).catch(err => {
                    console.error(`error creating ${err}`);
                    // TODO: Find proper way to throw error to the client
                    res.status(422).json(err.errors[0].message);
                });
        } catch (err) {
            // catch all errors
            res.status(500).json(`Error caught in route app.post("/api/postPhoto ..." ${err.errors[0].message}`);
        }

    }); // Route

    // Route to create photo for the currently authenticated user from a complete URL
    // NOTE: This is NOT the URL to be stored in photo DB, rather it is the
    // URL of the object that needs to be saved to google cloud storage since this *inputUrl*
    // Is not persistent - i.e. it may be coming from a text message etc.
    app.post("/api/photoURL", requiresLogin, (req, res) => {
        try {
            let photo = {};
            photo.fileTitle = req.body.fileTitle;
            photo.fileDescription = req.body.fileDescription;
            let inputPhotoURL = req.body.inputPhotoURL;

            photos.createUserPhotoFromUrl(req.user.uid, photo, inputPhotoURL)
                .then(photo => {
                    res.json(photo);
                }).catch(err => {
                    console.error(`error creating ${err}`);
                    res.status(422).json(err.errors[0].message);
                });
        } catch (err) {
            // catch all errors
            res.status(500).json(`Error caught in route app.post("/api/postPhoto ..." ${err.errors[0].message}`);
        }

    }); // Route

    // Delete Photo from DB AND Cloud Storage
    app.delete("/api/photo", requiresLogin, (req, res) => {
        try {
            let photo = {};
            photo.id = req.body.id;

            photos.deletePhoto(photo.id)
                .then(photo => {
                    res.json(photo);
                }).catch(err => {
                    console.error(`error creating ${err}`);
                    res.status(422).json(err);
                });
        } catch (err) {
            // catch all errors
            res.status(500).json(`Error caught in route app.post("/api/postPhoto ..." ${err.errors[0].message}`);
        }
    }); // Route
};