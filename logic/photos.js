"use strict";

// Requiring our models
const db = require("../models");
// Shared Credentials and common auth logic
const {
    uploadUserUrlToGCS,
    uploadPostUrlToGCS,
    destroyAllPostPhotosFromGCS,
    uploadTransactionUrlToGCS,
    destroyAllTransactionPhotosFromGCS,
    destroyFromGCS,
    uploadFileToGCS
} = require("./photoGCS");
const {
    getUser
} = require("./users");

class Photos {
    constructor() {
        // Constructor Logic
    }

    // Get all the photos for the currently authenticated user
    // you have to get user first sinnce we dont have user.id yet
    // we only habve the uid that comes from authentication
    getAllForUser(uidOrId) {
        return new Promise((resolve, reject) => {
            getUser(uidOrId).then(user => {
                db.Photo.findAll({
                    limit: 100,
                    order: [
                        ["updatedAt", "DESC"]
                    ],
                    where: {
                        UserId: user.id,
                    }
                }).then(photos => {
                    return resolve(photos);
                }).catch(err => {
                    return reject(err);
                });
            }).catch(err => {
                return reject(err);
            });
        });
    }

    // create photo in SQL DB for current user
    // The photo has already been saved in cloud storage on the client side
    // i.e. this is only to create the mySQL table entry in photos for lookup and relating to user in DB
    // you have to get user first sinnce we dont have user.id yet
    // we only habve the uid that comes from authentication
    createUserPhoto(uid, photo) {
        return new Promise((resolve, reject) => {
            getUser(uid).then(user => {
                //now save photo
                db.Photo.create({
                    UserId: user.id,
                    url: photo.url,
                    active: true,
                    fileName: photo.fileName,
                    fileTitle: photo.fileTitle,
                    fileDescription: photo.fileDescription
                }).then(photo => {
                    return resolve(photo);
                }).catch(err => {
                    return reject(err);
                });
            }).catch(err => {
                return reject(err);
            });
        });
    }

    // Save a photo from URL for a user AND create the photo info in SQL
    // you have to get user first sinnce we dont have user.id yet
    // we only habve the uid that comes from authentication
    createUserPhotoFromUrl(uidOrId, photo, photoUrl) {
        let promise = new Promise((resolve, reject) => {
            // get the user so we can attach
            getUser(uidOrId).then(user => {
                //  save the file to google cloud storage
                uploadUserUrlToGCS(user.uid, photoUrl).then((storageObject) => {
                    let publicURL = storageObject.publicURL;
                    console.log(publicURL);
                    let gcsObjectName = storageObject.gcsObjectName;

                    //now save photo
                    db.Photo.create({
                        UserId: user.id,
                        url: publicURL,
                        active: true,
                        fileName: gcsObjectName,
                        fileTitle: photo.fileTitle,
                        fileDescription: photo.fileDescription
                    }).then(photo => {
                        resolve(photo);
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });

        });

        return promise;
    }

    // delete photo from DB and from cloud storage
    async deletePhoto(photoId) {
        let promise = new Promise((resolve, reject) => {
            // get the fileName (aka google cloud storage object name) from SQL so we can delete from cloud storage
            db.Photo.findOne({
                where: {
                    id: photoId
                }
            }).then(photo => {
                // Delete from cloud storage
                destroyFromGCS(photo.fileName).then(() => {
                    // Delete from SQL
                    db.Photo.destroy({
                        where: {
                            id: photoId
                        }
                    }).then(photoId => {
                        resolve(photoId);
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        });
        return promise;
    }

    // Get all photos for a post
    getAllForPost(postId) {
        return new Promise((resolve, reject) => {
            db.Photo.findAll({
                limit: 100,
                order: [
                    ["updatedAt", "DESC"]
                ],
                where: {
                    PostId: postId
                }
            }).then(photos => {
                return resolve(photos);
            }).catch(err => {
                return reject(err);
            });
        });
    }

    // Create an entry in the photos table and save to GCS if needed
    // Its polymorphic, if photoInfoOrUrl is Url it streams saves to GCS and creates photo table entry
    // if its photoInfo object it just creates photo entry in mySQL DB since photo is already in GCS
    createPostPhoto(user, postId, photoInfoOrUrl) {
        return new Promise((resolve, reject) => {
            if (photoInfoOrUrl) {
                // figure out which one to call
                if (typeof photoInfoOrUrl === "string") {
                    // save with URL
                    this.createPostPhotoFromUrl(user, postId, photoInfoOrUrl).then(photo => {
                        return resolve(photo);
                    }).catch(err => {
                        return reject(err);
                    });
                } else {
                    // save with photo info
                    this.createPostPhotoSaved(postId, photoInfoOrUrl).then(photo => {
                        return resolve(photo);
                    }).catch(err => {
                        return reject(err);
                    });
                }
            } else {
                return reject("Must pass photo informaton or URL to save a photo for a post");
            }
        }); // Promise
    } // method

    // Save a photo from URL for a POST with Post Id
    // This is when the photo is ALREADY SAVED in GCS (on the client)
    // Must pass in photo.fileName and photo.url both should be passed from client when photo is saved
    // photo.fileName is the *primary key* of the object in GCS
    createPostPhotoSaved(postId, photoInfo) {
        return new Promise((resolve, reject) => {
            db.Photo.create({
                PostId: postId,
                url: photoInfo.url,
                active: true,
                fileName: photoInfo.fileName
            }).then(photo => {
                return resolve(photo);
            }).catch(err => {
                return reject(err);
            });
        });
    }

    // Save a photo from URL for a POST with Post Id
    // In this case you must save the photo first to GCS so you can get the gcsObjectName for later retrieval
    // since that is the *primary key* of the object in GCS
    createPostPhotoFromUrl(user, postId, photoUrl) {
        let promise = new Promise((resolve, reject) => {
            // first save the file to google cloud storage
            uploadPostUrlToGCS(user.uid, postId, photoUrl).then(storageObject => {
                let publicURL = storageObject.publicURL;
                console.log(publicURL);
                let gcsObjectName = storageObject.gcsObjectName;
                //now save photo
                db.Photo.create({
                    PostId: postId,
                    url: publicURL,
                    active: true,
                    fileName: gcsObjectName
                }).then(photo => {
                    resolve(photo);
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        });

        return promise;
    }

    // delete photo from DB and from cloud storage
    deletePostPhotos(postId) {
        let promise = new Promise((resolve, reject) => {
            // get the fileName (aka google cloud storage object name) from SQL so we can delete from cloud storage
            db.Photo.findOne({
                where: {
                    PostId: postId
                }
            }).then(photo => {
                // Dont delete if you dont find one
                if (photo && photo.id) {
                    // Delete from cloud storage - dont send back the photo, send back post
                    destroyFromGCS(photo.fileName).then(() => {
                        // Delete from SQL
                        db.Photo.destroy({
                            where: {
                                id: photo.id
                            }
                        }).then(photoId => {
                            resolve();
                        }).catch(err => {
                            reject(err);
                        });
                    }).catch(err => {
                        reject(err);
                    });
                } else {
                    resolve();
                }
            }).catch(err => {
                reject(err);
            });
        });
        return promise;
    }


} // Class

module.exports = Photos;