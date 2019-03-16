"use strict";

// Requiring our models
const db = require("../models");
// Shared Credentials and common auth logic
const {
    getUser
} = require("./users");
const Photo = require("./photos");
const photos = new Photo();

class Post {
    constructor() {
        // Constructor Logic
    }

    // Get all posts for user - get posts and photos
    getAllForUser(uidOrId) {
        return new Promise((resolve, reject) => {
            getUser(uidOrId).then(user => {
                db.Post.findAll({
                    limit: 100,
                    order: [
                        ["updatedAt", "DESC"]
                    ],
                    where: {
                        UserId: user.id
                    },
                    include: [db.Photo]
                }).then(posts => {
                    return resolve(posts);
                }).catch(err => {
                    return reject(err);
                });
            }).catch(err => {
                return reject(err);
            });
        });
    }

    // Get the post based on postId
    getOneForPostId(postId) {
        return new Promise((resolve, reject) => {
            db.Post.findOne({
                where: {
                    id: postId
                },
                include: [db.Photo]
            }).then(post => {
                return resolve(post);
            }).catch(err => {
                return reject(err);
            });
        });

    } // function

    // Create post:
    // This method is polymorphic -- switching on photoInfoOrUrl
    // If no photoInfoOrUrl exists just create post and dont save a photo for that post
    // If photoInfoOrUrl is a string it MUST be valid image URL and a photo will be created with the image at that URL and foreign key to post
    // If photoInfoOrUrl is an object, that means photo is already save in GCS,
    //  so a photo will be created in MySQL to link the photo to this post
    // In the case photoInfoOrUrl is an object, you MUST contain 2 properties:
    // minimum of photoInfo.url (public url) and photoInfo.fileName (GCS Storage Object Name)
    createUserPost(uidOrId, post, photoInfoOrUrl) {
        return new Promise((resolve, reject) => {
            getUser(uidOrId).then(user => {
                //now save photo
                db.Post.create({
                    UserId: user.id,
                    amount: post.amount,
                    title: post.title,
                    body: post.body,
                    active: true,
                    lastSignIn: post.lastSignin
                }).then(post => {
                    // If no photo is passed, dont create one for this post
                    // since a post does NOT have to have a photo
                    if (photoInfoOrUrl) {
                        photos.createPostPhoto(user, post.id, photoInfoOrUrl).then(photo => {
                            console.log(`${photo}`);
                            return resolve(post);
                        }).catch(err => {
                            return reject(err);
                        });
                    } else {
                        return resolve(post);
                    }
                }).catch(err => {
                    return reject(err);
                });
            }).catch(err => {
                return reject(err);
            });
        });
    }

    // Delete Single Post and all its photos
    // Must destro photo FIRST or post will destroy photo row so no way t get image
    // Turn off cascade as well
    deletePost(postId) {
        return new Promise((resolve, reject) => {
                // Send back the post -- not the photo
                photos.deletePostPhotos(postId).then(() => {
                    db.Post.destroy({
                        where: {
                            id: postId
                        }
                    }).then(function (rowsDeleted) {
                    return resolve(rowsDeleted);
                }).catch(err => {
                    return reject(err);
                });
            });
        });
    }
} // Class

module.exports = Post;